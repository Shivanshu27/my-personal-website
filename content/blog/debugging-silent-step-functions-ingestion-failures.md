---
title: "When Green Means Broken: Forensic Debugging of a Silent 77-Point Ingestion Failure in AWS Step Functions"
date: 2026-09-24T10:00:00+05:30
draft: false
tags: ["aws", "step-functions", "distributed-systems", "debugging", "incident-response", "reliability", "architecture"]
categories: ["system-design", "engineering"]
---

There is a category of production outage that keeps every senior systems engineer awake at night.

It isn’t a catastrophic crash that triggers a cacophony of PagerDuty alerts, nor is it a spike in HTTP 500 errors lighting up your CloudWatch dashboard in bright red.

It is the **silent outage**—the failure where every service reports healthy, every operational metric is in the green, and yet your business process is losing **79% of all customer data**.

```text
[ Incoming Production Documents ] ──► 100 Claims Ingested
                                            │
                                            ▼
                           [ AWS Step Functions Pipeline ]
                                            │
             ┌──────────────────────────────┴──────────────────────────────┐
             ▼                                                             ▼
  CloudWatch Dashboard:                                         Actual Business Outcome:
   "Executions: 100% SUCCEED"                                    "21 Claims Processed
    All Metrics Green!                                            79 Claims Disappeared!"
```

During a major enterprise client onboarding on our automated document appraisal platform, this exact nightmare occurred. Out of every 100 insurance claim files uploaded, only 21 cases ever appeared on the reviewer portal. Yet our orchestration engine, built on **AWS Step Functions**, reported a flawless **100% execution success rate**.

In this post, we will walk through the forensic investigation of this silent failure: the architectural anti-patterns that hid it, the compound defects across Lambdas and S3 presigned URLs, how we lifted ingestion reliability from **21% to 98% (+77 percentage points)**, and the operational framework for building self-healing distributed state machines.

---

## 1. The Ingestion Pipeline Architecture

Our platform ingests high-volume insurance claims consisting of multi-page PDF repair estimates, scanned photos, and structured metadata. 

Processing a single claim requires 4 distinct stages coordinated across distributed services:

```text
[ Client S3 Bucket ]
         │
         │ 1. S3 ObjectCreated Event
         ▼
[ Ingestion SQS Queue ]
         │
         │ 2. Lambda Trigger
         ▼
┌────────────────────────────────────────────────────────┐
│             AWS Step Functions Orchestration           │
├────────────────────────────────────────────────────────┤
│ 1. DownloadAssets (Extract PDF & images via S3)        │
│ 2. ExtractImagesFromPdf (pdftoppm + OpenCV extraction) │
│ 3. MLClassification (Classify estimate vs photo)      │
│ 4. CaseCreation (POST to Reviewer REST API)            │
└────────────────────────────────────────────────────────┘
```

Because document extraction and AI assessment can take anywhere from 10 seconds to several minutes, **AWS Step Functions (Standard Workflow)** served as the state machine orchestrator, providing durable task execution, state persistence, and automatic retries.

---

## 2. The Crisis: The "Silent Green" Anti-Pattern

During pre-production acceptance testing for our newest enterprise client, the operations team escalated an urgent issue:
> *"We uploaded a batch of 100 test claim PDFs into the S3 bucket. Our reviewers can only find 21 claims in the platform portal. Where are the other 79 cases?"*

The engineering team's initial response was confusion:
- The CloudWatch metric `ExecutionsFailed` was **0**.
- The Step Functions execution history showed **100 green executions** ending in the state `Succeed`.
- There were zero unhandled Lambda exceptions in our error logs.

To external observers, the pipeline was 100% healthy. In reality, **it was silently dropping 79 out of every 100 production claims.**

### Forensic Step 1: Inspecting the Raw Execution Graph
Rather than relying on aggregate CloudWatch metrics, I pulled the raw execution JSON history for one of the missing claims:

```json
{
  "executionArn": "arn:aws:states:us-east-1:123456789012:execution:IngestPipeline:claim_8921",
  "status": "SUCCEEDED",
  "events": [
    {
      "type": "TaskFailed",
      "details": {
        "error": "AssetFetchError",
        "cause": "HTTP 404: The specified key does not exist."
      }
    },
    {
      "type": "ExecutionSucceeded",
      "details": {
        "output": "{"status": "FAILED_HANDLED"}"
      }
    }
  ]
]
```

Looking at the Amazon States Language (ASL) definition revealed the fatal anti-pattern:

```json
{
  "Catch": [
    {
      "ErrorEquals": ["States.ALL"],
      "ResultPath": "$.error",
      "Next": "CleanUpAndExit"
    }
  ],
  "CleanUpAndExit": {
    "Type": "Succeed"  // <-- THE SILENT FAILURE TRAP!
  }
}
```

### The "Succeed" Anti-Pattern Explained
In AWS Step Functions, terminating a workflow in a state of type `Succeed` tells AWS: *"This business process completed successfully."*

Even though the workflow caught an exception, it routed execution to `Succeed`. As a result:
1. AWS CloudWatch recorded an **`ExecutionsSucceeded`** event.
2. The `ExecutionsFailed` metric remained at **zero**.
3. PagerDuty alarms remained silent.
4. Downstream dead-letter queues received nothing.

**The Golden Lesson:** Catching an exception is not the same as succeeding. If a distributed workflow cannot fulfill its business objective, it must terminate in a **`Fail`** state or explicitly route the payload to a monitored Dead-Letter Queue (DLQ).

---

## 3. Forensic Step 2: Uncovering the Root Causes

Once we forced failures to surface, we uncovered three distinct compound defects responsible for the 79% failure rate:

```text
┌───────────────────────────┬──────────────────────────────────┬─────────────────────────────────┐
│ Defect                    │ Mechanism                        │ Impact                          │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 1. Asset URI Corruption   │ Lambda stripped bucket prefix;   │ Caused HTTP 404 that surfaced   │
│                           │ hardcoded legacy S3 key paths    │ as misleading HTTP 400 error    │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 2. Presigned URL Expiry   │ S3 presigned PUT URLs had 15-min │ Multi-page batches failed with  │
│                           │ TTL; processing took > 20 mins   │ HTTP 403 Forbidden mid-flow     │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 3. Lack of Partial Loaders│ One corrupt image out of 50      │ Complete case dropped; reviewer │
│                           │ failed the entire claim batch    │ had zero visibility into error  │
└───────────────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

### Defect 1: The Lambda Path Reconstitution Bug
In our `ExtractMetadata` Lambda, code designed for a legacy client attempted to normalize asset URIs by stripping the bucket name:
```python
# ❌ BUG: Stripping bucket assuming single-tenant directory structure
bucket, key = parse_s3_uri(asset_uri)
# Hardcoded legacy assumption broke multi-tenant client prefix paths:
normalized_key = key.replace(f"clients/{tenant_id}/", "") 
```
This produced a malformed S3 key path. When the subsequent Step Function task attempted to read the file, S3 returned a `404 Not Found`.

### Defect 2: Ephemeral Presigned URLs vs. Canonical S3 Keys
When files were ingested, upstream services generated temporary S3 presigned URLs with a 15-minute Time-To-Live (TTL) and passed those URLs as the message payload to Step Functions.

However, during heavy batch uploads, messages queued in SQS for 10–12 minutes before Step Functions claimed them. By the time Step Functions attempted to download the PDF, the presigned URL had **expired**, returning `403 RequestTimeTooSkewed` or `AccessDenied`.

**The Architectural Fix:** State machines should pass **canonical resource identifiers** (`s3://bucket/key`), never short-lived presigned URLs. Workers generate fresh credentials or access S3 via native IAM roles at execution time.

---

## 4. The 4-Stage Remediation Architecture

We overhauled the ingestion state machine to make it resilient, transparent, and self-healing:

```text
========================================================================================
RESILIENT STEP FUNCTIONS ORCHESTRATION WITH OBSERVABILITY
========================================================================================
[ SQS Ingestion Event ]
           │
           ▼
[ State: DownloadAssets ] ──(Retry with Backoff)──► [ State: ExtractImages ]
           │ (On Max Retries Exceeded)                          │
           ▼                                                    ▼
┌─────────────────────────┐                            ┌─────────────────────────┐
│ Terminal State: Fail    │                            │ Terminal State: Succeed │
│ Type: "Fail"            │                            │ Type: "Succeed"         │
│ Error: "AssetFetchFail" │                            │ Metric: "CaseCreated"   │
└──────────┬──────────────┘                            └─────────────────────────┘
           │
           │ Emits CloudWatch Event
           ▼
┌────────────────────────────────────────────────────────┐
│ Dead-Letter Queue (SQS DLQ) + PagerDuty / Slack Alert  │
└────────────────────────────────────────────────────────┘
```

### 1. Proper ASL Error Handling & DLQ Routing
We updated the Amazon States Language definition to separate genuine business completion from technical failures:

```json
{
  "DownloadAssets": {
    "Type": "Task",
    "Resource": "arn:aws:lambda:...:function:DownloadAssets",
    "Retry": [
      {
        "ErrorEquals": ["Lambda.ServiceException", "Lambda.TooManyRequestsException"],
        "IntervalSeconds": 2,
        "MaxAttempts": 3,
        "BackoffRate": 2.0
      }
    ],
    "Catch": [
      {
        "ErrorEquals": ["States.ALL"],
        "ResultPath": "$.error",
        "Next": "PublishToDLQ"
      }
    ],
    "Next": "ExtractImages"
  },
  "PublishToDLQ": {
    "Type": "Task",
    "Resource": "arn:aws:states:::sqs:sendMessage",
    "Parameters": {
      "QueueUrl": "https://sqs.us-east-1.amazonaws.com/.../ingest-dlq",
      "MessageBody.$": "$"
    },
    "Next": "FailExecution"
  },
  "FailExecution": {
    "Type": "Fail",
    "Cause": "Pipeline failed during document ingestion",
    "Error": "IngestionFailure"
  }
}
```

### 2. Switching to Canonical S3 Key Resolution
We removed all passing of presigned URLs between pipeline stages. The state machine payload now carries immutable metadata:
```json
{
  "tenant_id": "tenant_enterprise_01",
  "claim_id": "claim_90214",
  "document_key": "raw/tenant_enterprise_01/claim_90214/estimate.pdf"
}
```
Workers download assets directly using their container IAM execution roles (`s3:GetObject`), eliminating all expiration failure modes.

### 3. Partial-Failure Loaders & Reviewer Visibility
Previously, if 1 out of 50 images in a claim failed OpenCV extraction, the entire claim was dropped.

We redesigned the extraction step to support **partial success**:
- If 48 out of 50 images extract cleanly, the claim is successfully created.
- The 2 failed images are badged with a warning in the reviewer portal (`EXTRACTION_WARNING: Image 12 unreadable`).
- Reviewers can view the original raw PDF directly via an on-demand presigned URL generated on click, preventing blocked workflows.

---

## 5. Results & Operational Impact

Following deployment of the hardened state machine and canonical S3 pathing:

```text
┌──────────────────────────────────────┬─────────────┬─────────────┐
│ Operational Metric                   │ Before Fix  │ After Fix   │
├──────────────────────────────────────┼─────────────┼─────────────┤
│ Ingestion Success Rate (Live PDFs)   │ 21.0%       │ 98.2%       │
│ Unhandled Case Loss                  │ 79.0%       │ 0.0%        │
│ Failed-Case Reviewer Visibility      │ 0.0%        │ 100.0%      │
│ Engineering Triage Overhead          │ ~15 hrs/wk  │ < 30 min/wk │
│ False Positive CloudWatch Metrics    │ 100% green  │ Eliminated  │
└──────────────────────────────────────┴─────────────┴─────────────┘
```

The ingestion success rate surged from **21% to 98% across batches of 100+ live enterprise claims**. The remaining 1.8% of cases were genuinely corrupted or password-protected PDFs, which now route cleanly to the Dead-Letter Queue with contextual error banners.

---

## Summary: Senior Incident Response Framework

When a silent failure hits distributed cloud workflows:

1. **Never Trust Aggregate Metrics Alone:** If customer telemetry disagrees with your dashboard, the dashboard is lying. Inspect raw, individual event-trace logs.
2. **Beware the `Succeed` Catch-All:** Never terminate a Step Function in `Succeed` when handling an unrecoverable failure. Route caught errors to a `Fail` state and an SQS Dead-Letter Queue.
3. **Pass Canonical Identifiers, Not Ephemeral Tokens:** Pass durable S3 keys (`s3://bucket/key`) through state machine states; never rely on short-lived presigned URLs for multi-stage asynchronous processing.
4. **Design for Partial Degradation:** In high-volume batch processing, a single corrupt artifact should never abort an entire multi-asset transaction. Surface partial results with clear diagnostic badges.
5. **Close the Alerting Loop:** Pair Step Functions `ExecutionsFailed` metrics with SQS DLQ backlog depth alarms connected to PagerDuty or Slack.
