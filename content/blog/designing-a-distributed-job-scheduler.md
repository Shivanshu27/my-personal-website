---
title: "Designing a Distributed Job Scheduler: Architecture, Timeliness, and Delivery Guarantees"
date: 2026-09-18T15:30:00+05:30
draft: false
tags: ["system-design", "distributed-systems", "architecture", "postgres", "redis", "queues"]
categories: ["system-design", "engineering"]
---

At first glance, building a job scheduler sounds almost trivial: *"Just run a background timer or a cron daemon, query the database for jobs due right now, and trigger them."*

In a small single-server application with a few dozen tasks, that naive script works fine. But when you scale to **100 million scheduled jobs**—spanning one-off reminders, delayed payment retries, and high-frequency recurring crons—the problem completely changes character.

At scale, a job scheduler is **not a high-QPS system; it is a timeliness-bound and reliability-bound system**. You are suddenly faced with two genuinely difficult distributed systems challenges:

1. **Efficient Due-Job Discovery:** How do you pinpoint the few hundred jobs due *this exact second* out of 100 million scheduled records without running full table scans that melt your database every tick?
2. **Delivery and Execution Guarantees:** How do you guarantee that every job triggers on time and runs **reliably**—without silently vanishing or double-firing—when workers, dispatchers, or networks crash mid-execution?

```text
[ Upstream Client / Service ] ──( Schedules Job for Future Time T )──► [ API Layer ]
                                                                             │
                                                                             ▼
                                                                  [ Durable Job Store ]
                                                                  (100M Scheduled Jobs)
                                                                             │
                                                                             ▼
                                                                  ┌─────────────────────┐
                                                                  │  DISPATCHER FLEET   │  ◄── "The Brain"
                                                                  │  (Finds due jobs)   │
                                                                  └──────────┬──────────┘
                                                                             │
                                                                             ▼
                                                                  ┌─────────────────────┐
                                                                  │    BUFFER QUEUE     │  ◄── Absorbs Bursts
                                                                  │   (SQS / Kafka)     │
                                                                  └──────────┬──────────┘
                                                                             │
                                                                             ▼
                                                                  ┌─────────────────────┐
                                                                  │    WORKER FLEET     │  ◄── "The Hands"
                                                                  │ (Executes reliably) │
                                                                  └──────────┬──────────┘
                                                                             │
                                                                             ▼
                                                                  [ Webhooks / Services ]
```

The fundamental design principle that makes this system workable is: **Separate the Brain from the Hands.**

- **The Brain (Dispatcher Fleet):** Evaluates time, discovers due tasks, advances schedules, and hands off work. It executes zero business logic.
- **The Hands (Worker Fleet):** Pulls ready tasks from an intermediate queue, executes the actual side-effects (webhooks, email dispatches, reports), and reports execution status.

In this post, we will break down the architectural blueprint, the underlying storage math, row-level concurrency primitives (`FOR UPDATE SKIP LOCKED`), tiered Redis caching, and how to emulate "effectively-once" delivery over unreliable networks.

---

## 1. System Requirements & The Core SLO

Before writing a line of code or picking a database, we must pin down the exact operational contract.

### Functional Capabilities
- **Flexible Scheduling Patterns:**
  - *One-off at absolute time:* "Run on `2026-10-01T09:00:00Z`."
  - *Relative delay:* "Send this reminder in 24 hours" (computed as `now() + 86,400s`).
  - *Recurring (Cron):* "Run every Monday at 08:00 UTC" or "Run every 5 minutes" (`*/5 * * * *`).
- **Callback Execution:** Execute tasks via HTTP webhooks, message bus publishing, or triggering internal worker functions.
- **Lifecycle Management:** Allow clients to cancel, pause, resume, or update upcoming schedules before they trigger.
- **Inspection & History:** Query execution logs (attempt counts, start/end timestamps, failure payloads, status).

### Non-Functional Guarantees (The Hard Part)
- **Timeliness (The Headline SLO):** A task scheduled for `03:00:00` should fire within a tight, bounded window—our target is **p99 firing latency under a few seconds**, not minutes.
- **Delivery Guarantee:** Over an unreliable network, distributed systems must choose between *at-most-once* (risk losing jobs on crash) and *at-least-once* (guarantee execution, but risk duplicates on crash). We choose **at-least-once delivery coupled with idempotent execution** to achieve "effectively once."
- **Durability:** Once accepted, a job must survive arbitrary machine crashes. State must live in persistent storage, never in volatile memory alone.
- **No Double-Fire for the Same Scheduled Instant:** Even if five dispatchers wake up concurrently, a recurring job must never be dispatched twice for the exact same scheduled timestamp.

---

## 2. Capacity Estimates: The Storage & Discovery Math

A distributed job scheduler is fundamentally **timeliness-bound, not QPS-bound**. Let us run the numbers to understand where the real bottlenecks lie:

| Metric | Estimated Value | Architectural Implication |
| :--- | :--- | :--- |
| **Total Jobs at Rest** | 100,000,000 jobs | ~60 GB definition footprint (fits in RAM or single primary DB) |
| **Daily Executions** | 10,000,000 runs/day | Steady flow throughout the day |
| **Average Execution Rate** | ~116 executions/sec | Modest steady-state throughput |
| **Peak Execution Rate (10x)** | ~1,200 executions/sec | Bursty traffic on round times (top-of-hour, midnight) |
| **Job Definition Storage** | 100M × 0.6 KB ≈ 60 GB | Easily managed in standard relational databases |
| **Execution History Storage** | 10M × 200 B ≈ 2 GB/day | ~730 GB/year; must be time-partitioned and archived |

### The Due-Job Discovery Bottleneck

Why cannot a background loop simply poll the database every second?

```text
[ NAIVE FULL-TABLE SCAN ]
Every second: "SELECT * FROM jobs WHERE next_run_time <= now()"
  -> 100,000,000 rows scanned × 1 query/sec = 100 Million row scans/sec!
  -> Result: CPU hits 100%, disk thrashing, database crashes immediately.

[ INDEXED / TIME-ORDERED LOOKUP ]
With a B-Tree index on (next_run_time, status):
  -> Reads ONLY the ~116 (avg) or ~1,200 (peak) rows that are actually due!
  -> Result: Sub-millisecond index seek; trivial I/O overhead.
```

The contrast between **100,000,000 rows scanned per second** and **~1,200 indexed rows read per second** is the crux of scheduler architecture. The primary database role is not high-throughput writes; it is maintaining a clean, time-ordered index for rapid lookups.

Furthermore, notice the divergence in storage lifecycles:
- **Job Definitions:** 100M rows take only **~60 GB**. This table is small, hot, and constantly updated.
- **Execution History:** At **2 GB per day**, history grows to hundreds of gigabytes rapidly. It must be partitioned by month, retained for 90 days in hot storage, and archived to cold Parquet/S3 storage.

---

## 3. Public API & Data Contracts

The client-facing layer is a clean, stateless REST API deployed behind a load balancer.

```text
       [ Client Application ]
           │             ▲
  1. POST  │             │  2. 201 Created
   /jobs   │             │     {"job_id": "job_123", "next_run_time": "..."}
           ▼             │
┌─────────────────────────────┐
│     Scheduler API Layer     │
│   (Stateless behind an LB)  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Durable Postgres Storage   │
└─────────────────────────────┘
```

### Scheduling a Job
```http
POST /api/v1/jobs
Content-Type: application/json
```
```json
{
  "name": "generate-invoices",
  "schedule": "0 3 1 * *",
  "run_at": null,
  "delay_seconds": null,
  "target": {
    "type": "webhook",
    "url": "https://billing.internal/generate",
    "method": "POST"
  },
  "payload": { "tenant_id": "cust_4892", "batch_size": 500 },
  "max_retries": 5,
  "idempotency_key": "client-uuid-9876"
}
```

- **`idempotency_key`:** Prevents duplicate job creation if network timeouts cause client retries.
- **Scheduling Options:** Accepts either an absolute timestamp (`run_at`), a relative offset (`delay_seconds`), or a standard cron string (`schedule`).

### Lifecycle & Inspection Operations
- `DELETE /api/v1/jobs/{job_id}`: Soft-deletes or marks the job as `cancelled`.
- `POST /api/v1/jobs/{job_id}/pause`: Halts execution without losing schedule configuration.
- `PATCH /api/v1/jobs/{job_id}`: Updates payload or cron expression, recalculating `next_run_time` atomically.
- `GET /api/v1/jobs/{job_id}/executions`: Returns execution logs, attempt numbers, and failure diagnostics.

---

## 4. Data Model: Dual Tables & The Double-Firing Bedrock

We separate mutable job definitions from immutable execution records.

```text
┌────────────────────────────────────────────────────────┐
│                      jobs Table                        │
├─────────────────┬──────────────┬───────────────────────┤
│ Column          │ Type         │ Details               │
├─────────────────┼──────────────┼───────────────────────┤
│ job_id (PK)     │ UUID         │ Primary Identifier    │
│ owner_id        │ String       │ Tenant / User ID      │
│ schedule_type   │ Enum         │ cron / once           │
│ cron_expr       │ String       │ e.g. "0 3 * * *"      │
│ next_run_time   │ Timestamp    │ INDEXED (Hot Column!) │
│ status          │ Enum         │ active, paused, etc.  │
│ target          │ JSONB        │ Webhook / Queue Spec  │
│ payload         │ JSONB        │ Task Arguments        │
│ max_retries     │ Integer      │ Default: 3 - 5        │
│ created_at      │ Timestamp    │ Audit timestamp       │
└─────────────────┴──────────────┴───────────────────────┘
                           │ 1
                           │ has many
                           ▼ N
┌────────────────────────────────────────────────────────┐
│                   executions Table                     │
├─────────────────┬──────────────┬───────────────────────┤
│ execution_id    │ UUID (PK)    │ Primary Identifier    │
│ job_id (FK)     │ UUID         │ References jobs       │
│ scheduled_time  │ Timestamp    │ Intended fire instant │
│ started_at      │ Timestamp    │ Worker lease start    │
│ finished_at     │ Timestamp    │ Completion timestamp  │
│ status          │ Enum         │ running/success/dead  │
│ attempt_count   │ Integer      │ Current retry count   │
│ worker_id       │ String       │ Current leaseholder   │
│ lease_expiry    │ Timestamp    │ Visibility timeout    │
└─────────────────┴──────────────┴───────────────────────┘
```

### The Bedrock Constraint Against Double-Firing

How do we guarantee that even under race conditions, two concurrent dispatchers never enqueue the same job twice for the same scheduled moment?

The `executions` table enforces a strict composite unique constraint:

```sql
ALTER TABLE executions ADD CONSTRAINT unique_job_instance 
UNIQUE (job_id, scheduled_time);
```

For a recurring job scheduled for `03:00:00 UTC`, its `scheduled_time` is `2026-09-18 03:00:00`. If two dispatchers attempt to process this job concurrently, the first insert succeeds, while the second triggers a unique key violation (`23505 unique_violation` in PostgreSQL) and is discarded cleanly.

### Storage Engine Comparison

| Feature | Relational (PostgreSQL) | NoSQL (Cassandra / DynamoDB) | In-Memory (Redis ZSET) |
| :--- | :--- | :--- | :--- |
| **Range Scan (`<= now()`)** | Native B-Tree Index | Awkward (requires time bucketing) | Native (`ZRANGEBYSCORE`) |
| **Row-Level Concurrency** | `FOR UPDATE SKIP LOCKED` | Complex (distributed lock needed) | Atomic single-threaded operations |
| **Durability** | Full (WAL on persistent disk) | Full | Volatile / Rebuildable cache |
| **Best Architectural Role** | **Durable Source of Truth** | **Cold Execution History** | **Hot-Horizon Near-Term Index** |

---

## 5. Deep Dive: Finding Due Jobs Efficiently

How does the dispatcher fleet pull due tasks every second without causing deadlocks or query spikes?

```text
APPROACH 1: Postgres FOR UPDATE SKIP LOCKED
Dispatcher 1 ──► [ SELECT ... FOR UPDATE SKIP LOCKED ] ──► Claims Rows 1-100 (Locked)
Dispatcher 2 ──► [ SELECT ... FOR UPDATE SKIP LOCKED ] ──► Skips Locked, Grabs Rows 101-200!

APPROACH 2: Tiered DB + Redis Sorted Set (Sub-second Precision)
[ Postgres (All 100M Jobs) ] ──(Every 1 min sweep)──► [ Redis ZSET (Next 5m Jobs) ]
                                                               │
                                                               │ ZRANGEBYSCORE (< now)
                                                               ▼
                                                        [ Sub-second Pop! ]
```

### Approach 1: Polling PostgreSQL with `FOR UPDATE SKIP LOCKED`

If you are running a moderate workload (hundreds to thousands of jobs per second), you do not need complex distributed lock managers like ZooKeeper, etcd, or Consul. PostgreSQL gives you safe, coordinated polling out of the box:

```sql
BEGIN;

SELECT job_id, schedule_type, cron_expr, next_run_time, target, payload
FROM jobs
WHERE next_run_time <= NOW() 
  AND status = 'active'
ORDER BY next_run_time ASC
LIMIT 100
FOR UPDATE SKIP LOCKED;

-- 1. Advance next_run_time for recurring jobs (or mark 'completed' for one-offs)
-- 2. Insert record into executions table
-- 3. Push task to message queue

COMMIT;
```

#### How `SKIP LOCKED` Works (The Buffet Line Metaphor)
Imagine a buffet line where food trays have closed lids:
- Standard `FOR UPDATE` is like waiting in line behind someone lifting a lid: everyone behind them **blocks and halts** until they finish serving themselves. In a database, this causes lock contention, queueing, and deadlocks.
- `FOR UPDATE SKIP LOCKED` means: if a tray is currently open and being served by another guest, you **do not wait**—you immediately skip ahead to the next available closed tray.

Dispatcher A locks rows 1 through 100. Dispatcher B issues the same query at the exact same millisecond, automatically skips rows 1–100 without waiting, and immediately grabs rows 101–200. No coordination server, no lock timeouts, and zero deadlocks.

### Approach 2: Tiered Production Architecture (PostgreSQL + Redis ZSET)

When scale grows and you require sub-second firing precision without placing constant polling load on PostgreSQL, you layer a **Hot Horizon Index** in Redis using a **Sorted Set (ZSET)**.

```text
┌────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                  │
│                (100M Jobs at Rest on Disk)             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Background Sweeper (Runs every 1 min)
                           │ "SELECT * WHERE next_run_time BETWEEN now AND now + 5min"
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Redis Sorted Set (ZSET)                │
│                 Key: 'scheduler:hot_jobs'              │
│                 Score: Unix Epoch Timestamp            │
│                 Member: Job ID                         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Dispatchers pop due jobs every 500ms
                           │ ZRANGEBYSCORE scheduler:hot_jobs -inf <current_epoch>
                           ▼
┌────────────────────────────────────────────────────────┐
│                    DISPATCHER FLEET                    │
└────────────────────────────────────────────────────────┘
```

1. **The 5-Minute Sliding Horizon:** A background sweeper process queries PostgreSQL once every minute for all jobs due in the next 5 minutes (`[now, now + 300s]`).
2. **Push to Redis:** The sweeper inserts them into a Redis Sorted Set:
   ```bash
   ZADD scheduler:hot_jobs 1789725600 "job_abc123"
   ```
3. **Atomic Sub-Second Dispatch:** Dispatchers poll Redis using an atomic Lua script:
   ```lua
   -- Atomic fetch and remove of due jobs
   local due_jobs = redis.call('ZRANGEBYSCORE', KEYS[1], '-inf', ARGV[1], 'LIMIT', 0, 100)
   if #due_jobs > 0 then
       redis.call('ZREM', KEYS[1], unpack(due_jobs))
   end
   return due_jobs
   ```
4. **Algorithmic Efficiency:** Querying and removing elements from a Redis ZSET takes **O(log N + M)** time (where N is the number of elements in the 5-minute window and M is the number of popped jobs). Popping 100 jobs takes less than a millisecond.
5. **Fault Tolerance:** Because Redis acts purely as a non-authoritative cache for the near-term horizon, **if the Redis node crashes, zero data is lost**. A newly spun-up instance simply triggers an immediate reload query from PostgreSQL.

### Eliminating Clock Drift & Skew
In distributed systems, server hardware clocks drift naturally. If Dispatcher 1 has a clock running 2 seconds fast while Dispatcher 2 is 2 seconds slow, jobs might fire out of order or prematurely.

**The Fix:** Never use local server time (`System.currentTimeMillis()` or `new Date()`) to decide if a job is due. Standardize on the centralized database engine clock (`NOW()`) or synchronize all server nodes using strict AWS Time Sync / Network Time Protocol (NTP) with bounded drift alarms.

---

## 6. Deep Dive: Reliable Execution & Delivery Guarantees

Once the dispatcher discovers a due job, how do we guarantee it actually executes?

```text
                    [ Message Queue: Job X ]
                               │
                     1. Leases │ (Visibility Timeout = 60s)
                               ▼
                      ┌─────────────────┐
                      │    Worker 1     │
                      └────────┬────────┘
                               │ 2. Executes job side-effect
                               ▼
                      [ Target System ]
                               │
                      💥 WORKER 1 CRASHES (Before sending ACK to Queue!)
                               │
                      3. 60s Visibility Lease Expires in Queue
                         Job X becomes visible again!
                               │
                      4. Redelivered
                               ▼
                      ┌─────────────────┐
                      │    Worker 2     │
                      └────────┬────────┘
                               │ 5. Executes Job X with same Idempotency Key!
                               ▼
                      [ Target System ] ──► Detects Key: "Already Processed!"
                                            Returns cached success (No-Op)
                               │
                      6. ACK   ▼
                      [ Queue: Job X Deleted ]
```

### The Distributed Impossibility of "Exactly-Once" Delivery

It is a common pitfall in system design discussions to claim a system provides "exactly-once delivery." In any network-connected distributed system, this is physically impossible due to the classic **Two-Generals Problem**.

Consider what a worker must do:
1. Trigger the external task (e.g., hit a billing webhook or charge a credit card).
2. Acknowledge (ACK) completion to the message queue.

What happens if the worker or network crashes **after Step 1, but before Step 2**?
- If the system assumes the job succeeded, it drops the message → **At-Most-Once delivery** (risk of silent data loss).
- If the system redelivers the message when no ACK arrives → **At-Least-Once delivery** (risk of duplicate execution).

### The Solution: At-Least-Once + Idempotency = "Effectively Once"

Because silent data loss is unacceptable for critical jobs, we adopt **at-least-once delivery** and make redelivery 100% safe by enforcing **idempotency**.

Every execution carries a deterministic idempotency key:

```text
idempotency_key = sha256(job_id + ":" + scheduled_time)
```

When the downstream service receives the task, it checks its local datastore for that key inside a transaction:
- If the key does not exist: execute the task, persist the key, and return `200 OK`.
- If the key already exists: do not re-run the business logic; immediately return the cached `200 OK`.

### Visibility Leases & Poison Jobs

1. **Visibility Timeout:** When Worker 1 claims a message from the queue (e.g., Amazon SQS), the message is hidden from other workers for a lease duration (e.g., 60 seconds). If the task takes longer, Worker 1 issues periodic heartbeat pings to extend the lease.
2. **Worker Crash Recovery:** If Worker 1 terminates abruptly, its visibility lease expires automatically. The queue makes the message visible again, allowing Worker 2 to claim and complete it.
3. **Poison Task Handling:** If a malformed payload causes the worker to crash or throw an unhandled exception:
   - The queue increments the `ReceiveCount`.
   - Subsequent retries apply **exponential backoff with jitter**:
     `delay = (2 ^ attempt) * base_delay + rand(0, jitter)`
   - Once `attempt_count >= max_retries` (e.g., 5), the job transitions to `status = 'dead'` and routes to a **Dead-Letter Queue (DLQ)** for engineer inspection.

### The Job Execution State Machine

```text
   [ Scheduled ]
         │ (next_run_time arrives)
         ▼
   [ Enqueued ] ──(Worker leases task)──► [ Running ]
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
         [ Succeeded ]                 [ Failed ]                   [ Worker Crash ]
         (Acked & Done)                      │                      (Lease Expired)
                                   attempts  │  attempts                   │
                                     < max   │   == max                    │
                                             ▼                             ▼
                                      [ Enqueued ]                   [ Enqueued ]
                                   (Backoff Retry)               (Redelivered to W2)
                                             │
                                             ▼
                                      [ Dead / DLQ ]
```

---

## 7. System Scaling, Spikes & Edge-Case Architecture

### 1. Mitigating the "3:00 AM Thundering Herd"
In enterprise systems, hundreds of thousands of users configure jobs to run at midnight or the top of the hour: *"Run every day at 3:00 AM"*.

If 100,000 jobs become due at `03:00:00.000`, attempting to fire them at the exact same microsecond can overwhelm your database and downstream APIs.

**The Two-Layer Defense:**
1. **Schedule Jittering:** Unless a job strictly mandates second-level accuracy, inject randomized jitter at creation time:
   ```text
   scheduled_time = 03:00:00 + rand(0, 180 seconds)
   ```
   This flattens a spike of 100,000 tasks into an even stream across a 3-minute window.
2. **Queue Buffering:** The dispatcher pushes due jobs into a message queue (SQS / Kafka) rather than invoking targets directly. The queue acts as a massive shock absorber.

```text
Without Queue:
[ 100,000 Jobs Due ] ──► [ Direct Webhook Calls ] ──► [ Downstream APIs Crash! ]

With Buffer Queue:
[ 100,000 Jobs Due ] ──► [ SQS Buffer ] ──► [ Autoscaled Worker Fleet ] ──► [ Controlled Drain ]
```

### 2. Stateless Worker Autoscaling
Workers run in stateless containers (such as AWS ECS Fargate or Kubernetes). The autoscaler adjusts the number of worker containers dynamically based on queue backlog depth:

```text
Desired Workers = Queue Message Backlog / Target Processing Time per Worker
```

When a burst arrives, the queue absorbs the shock while the worker fleet automatically scales out from 20 to 200 instances to drain the backlog, scaling back down once the queue is clear.

### 3. Dispatcher Fleet Sharding
When total job volume exceeds the capacity of a single active poller, partition the scheduled jobs across N virtual buckets:

```text
bucket_id = hash(job_id) % N
```

Each dispatcher instance is assigned exclusive ownership of specific bucket partitions (e.g. via consistent hashing or a lightweight Raft coordinator), ensuring parallel polling without overlapping database queries.

### 4. Extended Outage Recovery & Catch-Up Policies
What happens if the entire scheduler platform suffers a catastrophic 2-hour infrastructure outage? When systems restore, millions of recurring jobs will be overdue.

If a recurring job runs every 5 minutes, should it trigger 24 times back-to-back?

We enforce an explicit **Catch-Up Policy** configured per job:
- **`skip` (Default for time-sensitive tasks):** For real-time metrics collection, stock price checks, or ping monitors, old runs are completely irrelevant. The scheduler logs the missed runs as `skipped` and updates `next_run_time` directly to the next future recurrence.
- **`run-once catch-up` (For stateful rollups):** For daily financial reports or ledger synchronizations, running 24 times would hammer downstream databases. The scheduler fires a single catch-up run covering the entire missed interval.
- **`backfill` (Strict historical pipelines):** Every missed instance is replayed sequentially with rate limiting.

---

## 8. Architectural Trade-Offs Matrix

| Architectural Decision | What We Gained | What We Sacrificed |
| :--- | :--- | :--- |
| **`FOR UPDATE SKIP LOCKED`** | Concurrent multi-dispatcher polling without external lock clusters | Polling database queries on every tick |
| **Redis ZSET Hot Horizon** | Sub-second dispatch precision with O(log N + M) pops | Added operational complexity of cache synchronization |
| **At-Least-Once Delivery** | Zero lost jobs during process and network failures | Downstream targets must implement idempotency |
| **Buffer Queue (SQS / Kafka)** | Smooth absorption of 10x thundering herd spikes | Latency hop between scheduling decision and execution |
| **Schedule Jittering** | Eliminates top-of-hour CPU and I/O spikes | Slight deviation from round-minute triggering |
| **Run-Once Catch-Up Policy** | Prevents queue exhaustion after long platform outages | Drops individual intermediate recurring ticks |

---

## Summary: The Senior Engineer's Rule of Thumb

When designing or evaluating a distributed job scheduler, avoid over-engineering prematurely:

1. **For small to medium workloads (< 100,000 jobs):**  
   A single PostgreSQL primary database using `SELECT ... FOR UPDATE SKIP LOCKED` combined with an index on `(next_run_time, status)` is a complete, resilient, and battle-tested scheduler. It requires zero external dependencies and avoids distributed coordination bugs.
2. **For enterprise workloads (millions of jobs + bursty peaks):**  
   Introduce the tiered architecture:
   - Keep PostgreSQL as your durable, authoritative source of truth.
   - Separate the **Brain** (Dispatcher) from the **Hands** (Workers) via an intermediate queue.
   - Layer a **Redis Sorted Set** for a 5-minute sliding hot horizon to achieve sub-second pop latencies.
   - Accept that true distributed exactly-once execution does not exist—rely on **at-least-once delivery** with visibility timeouts and enforce **idempotency keys** at the worker boundary.
