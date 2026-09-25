---
title: "From Kubernetes to AWS ECS Fargate: A Pragmatic Blueprint for Zero-Downtime ML Workload Migrations"
date: 2026-09-23T10:00:00+05:30
draft: false
tags: ["aws", "kubernetes", "ecs-fargate", "cloud-migration", "machine-learning", "infrastructure-as-code", "terraform"]
categories: ["system-design", "engineering"]
---

In the modern cloud ecosystem, **Kubernetes (K8s)** is often treated as the default architecture for microservices. And for large platform teams managing thousands of heterogeneous services across massive fleets of bare-metal or cloud instances, K8s is indispensable.

But Kubernetes is not free. It imposes a massive **operational tax**:
- Dedicated cluster administrators to manage control planes, CNI plugins, and Ingress controllers.
- Constant version deprecations and node pool patching cycles.
- Complex resource allocation, DaemonSets, and Cluster Autoscaler tuning.

Recently, as part of an enterprise client acquisition and technology transfer, our team faced a critical architectural mandate: **migrate a suite of high-throughput machine learning services off a shared internal Kubernetes cluster onto an isolated, client-owned AWS cloud environment.**

The client had a firm operational constraint: **they ran a lean infrastructure team with zero dedicated Kubernetes engineers.** Handing them a complex EKS cluster would have created an operational nightmare.

We chose **AWS ECS Fargate**.

```text
[ Shared Enterprise K8s Cluster ] ────( Complete Platform Migration )────► [ AWS ECS Fargate ]
 • Multi-tenant overhead                                                     • Serverless containers
 • Self-managed Ingress & CNI                                               • Native IAM & VPC integration
 • Node pool scaling complexity                                              • Zero node maintenance
```

In this post, we’ll explore the end-to-end migration blueprint: architecting infrastructure-as-code with AWS SAM and Terraform, handling heavy ML models with **3 to 5 minute cold-start initialization times**, and executing a **zero-downtime DNS cutover** without dropping a single in-flight prediction request.

---

## 1. The Workload: Heavy Machine Learning in Production

Our migration encompassed three distinct production services handling automated physical property inspection and computer-vision appraisal:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 3 MIGRATED ML MICROSERVICES                           │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Service                  │ Architecture & Tech      │ Resource Profile & Cold Start    │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 1. Deep Feature Embedder │ Ray Serve 2.2 + PyTorch  │ 8 vCPU, 16 GB RAM                │
│                          │ OpenCLIP ViT-L-14 (934MB)│ 8-10 min model loading & warm-up │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 2. Property Damage API   │ FastAPI + scikit-learn   │ 8 vCPU, 16 GB RAM                │
│                          │ 70+ ensemble models      │ 3-5 min loading serialized models│
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 3. PII Anonymization     │ Serverless Python Lambda │ Ephemeral event-driven execution │
│                          │ PyTorch face/blurring    │ Sub-second warm execution        │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

The primary engineering challenges centered on Services #1 and #2:
- **Massive Memory Footprint:** Loading hundreds of megabytes of serialized neural weights and tabular regression ensembles required 16GB of resident memory per task.
- **Protracted Cold Starts:** An application taking 4 minutes just to load models into memory will fail naive container health checks, triggering vicious **crash-restart loops**.

---

## 2. Target Architecture on AWS ECS Fargate

We designed a fully managed, serverless container architecture isolated within a multi-AZ private Virtual Private Cloud (VPC):

```text
                                  [ User Requests ]
                                          │
                                          ▼
                             [ AWS Route 53 (Custom DNS) ]
                                          │
                                          ▼
                          [ Application Load Balancer (ALB) ]
                               (TLS Termination, ACM Cert)
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         [ Private Subnet - AZ A ]                       [ Private Subnet - AZ B ]
   ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
   │ ECS Fargate Task 1                  │         │ ECS Fargate Task 2                  │
   │ (FastAPI / Ray Serve)               │         │ (FastAPI / Ray Serve)               │
   │ 8 vCPU / 16 GB RAM                  │         │ 8 vCPU / 16 GB RAM                  │
   └──────────────────┬──────────────────┘         └──────────────────┬──────────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                    [ VPC Endpoints (PrivateLink: S3, Secrets Manager) ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
             [ Amazon S3 Bucket ]                          [ AWS Secrets Manager ]
             (Model Weights & Data)                        (Credentials & Config)
```

### Key Architectural Pillars
1. **Zero Node Management:** ECS Fargate abstracts away EC2 instances, AMI patching, and container daemon maintenance. We declare the required vCPU and memory; AWS provisions compute on demand.
2. **Private Network Isolation:** All Fargate tasks execute in private subnets with zero public IP addresses. Outbound traffic to Amazon S3 and AWS Secrets Manager routes through **VPC Endpoints (PrivateLink & Gateway Endpoints)**, keeping data within the AWS private backbone.
3. **Internal Service Mesh via Cloud Map:** Inter-service RPC between the microservices uses **AWS Service Discovery (Cloud Map)**, providing local private DNS resolution (`service.internal`) without routing through external load balancers.

---

## 3. The 5-Minute Cold Start Problem: Taming Health Checks

In a typical web API, a container boots in 2 seconds. In machine learning serving, a container must:
1. Boot the OS and Python runtime (5 seconds).
2. Download model checkpoints from S3 or local image cache (30 seconds).
3. Deserialize 70+ Scikit-learn models or load a 934MB PyTorch OpenCLIP tensor into memory (120–180 seconds).
4. Run dummy "warm-up" tensor inference through the GPU/CPU matrix to compile execution graphs (30 seconds).

**Total cold-start duration: ~4 minutes.**

### The Naive Mistake: The Infinite Reboot Loop
If you deploy this service behind a standard Application Load Balancer with default health check settings (interval: 30s, timeout: 5s, unhealthy threshold: 2):

```text
Container Starts ──► [ Booting & Loading Models... ]
                              │
                    (At T = 30s) ALB sends GET /health
                    Container cannot respond yet ──► Timeout 1
                              │
                    (At T = 60s) ALB sends GET /health
                    Container still deserializing ──► Timeout 2
                              │
              ❌ ALB marks target UNHEALTHY!
              ECS terminates task and launches a new one!
              New container starts loading models...
              🔁 INFINITE CRASH-RESTART LOOP!
```

### The Solution: Multi-Layer Grace Period Tuning
To accommodate long cold-start initialization safely, we tuned four specific configuration levers across AWS SAM (CloudFormation) and the ALB target groups:

```yaml
# AWS SAM / CloudFormation Task Definition
Resources:
  MLService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref ProductionCluster
      DesiredCount: 4
      LaunchType: FARGATE
      HealthCheckGracePeriodSeconds: 420  # <-- 7 MINUTES GRACE PERIOD!
      DeploymentConfiguration:
        MaximumPercent: 200
        MinimumHealthyPercent: 100
        DeploymentCircuitBreaker:
          Enable: true
          Rollback: true

  TargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: 8000
      Protocol: HTTP
      VpcId: !Ref VPC
      TargetType: ip
      HealthCheckPath: /health/ready
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 10
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 5
      TargetGroupAttributes:
        - Key: deregistration_delay.timeout_seconds
          Value: "300"  # <-- 5 MINUTES CONNECTION DRAINING!
```

### Why These Specific Values Matter
1. **`HealthCheckGracePeriodSeconds: 420`:** Instructs ECS to completely ignore ALB target health status for the first 7 minutes of a new task's life. ECS will not kill the task while it is busy loading weights.
2. **Distinct `/health/live` vs `/health/ready` Endpoints:**  
   - `/health/live` returns `200 OK` as soon as the HTTP server is bound to the port.
   - `/health/ready` returns `503 Service Unavailable` until all 70 models are 100% loaded into RAM and verified. The ALB only routes customer traffic once `/health/ready` turns green.
3. **`deregistration_delay.timeout_seconds: 300`:** Deep learning inference requests can take 15–30 seconds to process heavy TIFF images. When autoscaling down or deploying a new version, a 5-minute deregistration delay ensures existing in-flight requests finish cleanly before the container receives a `SIGTERM`.

---

## 4. Multi-Account CI/CD with GitHub Actions & AWS OIDC

To maintain enterprise security during the deployment pipeline, we eliminated static AWS access keys (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) entirely from our GitHub repositories.

Instead, our multi-environment GitHub Actions pipeline authenticates via **OpenID Connect (OIDC)**:

```text
[ GitHub Actions Runner ]
           │
           │ 1. Requests OIDC JWT token from GitHub
           ▼
[ GitHub OIDC Provider ]
           │
           │ 2. Exchanges JWT for temporary AWS STS credentials
           ▼
[ AWS STS (AssumeRoleWithWebIdentity) ]
           │
           │ 3. Validates repo: "my-org/ml-service" and branch: "main"
           ▼
[ Temporary 1-Hour IAM Credentials ] ──► Deploy to Dev / Preprod / Prod
```

### Zero-Downtime Rolling Deployments
With `MinimumHealthyPercent: 100` and `MaximumPercent: 200`:
- When deploying version `v2`, ECS spins up 4 new Fargate containers alongside the 4 active `v1` containers.
- The new containers take ~4 minutes to initialize models.
- Once the ALB target group confirms all 4 `v2` containers pass `/health/ready`, traffic shifts seamlessly.
- The 4 `v1` containers enter the 300-second connection draining phase and terminate cleanly.
- **Zero dropped connections, zero user-visible downtime.**

---

## 5. The DNS Cutover: Route 53 Weighted Routing

The final phase was transferring production traffic from the legacy Kubernetes ingress to the new ECS Fargate ALB.

Rather than flipping a hard binary switch (which risks catastrophic failure if an unexpected edge-case emerges), we executed a **gradual weighted DNS canary rollout** using AWS Route 53:

```text
                                [ Client DNS Queries ]
                                          │
                                          ▼
                             [ AWS Route 53 CNAME / A ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
         Weight: 90% (Initial)                           Weight: 10% (Canary)
                  ▼                                               ▼
    [ Legacy Kubernetes Cluster ]                     [ New AWS ECS Fargate ALB ]
```

### Cutover Schedule
1. **Day 1 (Canary 10%):** Route 10% of traffic to ECS Fargate. Monitor CloudWatch latency dashboards, container memory saturation, and prediction accuracy logs for 24 hours.
2. **Day 2 (Split 50%):** Increase weight to 50%. Validate autoscaling behavior under peak midday workloads.
3. **Day 3 (100% Final Cutover):** Shift 100% of DNS traffic to the ECS Fargate Application Load Balancer. Keep the legacy Kubernetes deployment running in standby mode for 72 hours before decommissioning.

---

## 6. Kubernetes vs. ECS Fargate: The Production Verdict

| Dimension | Kubernetes (EKS / Self-Managed) | AWS ECS Fargate |
| :--- | :--- | :--- |
| **Operational Overhead** | High (control plane, CNI, ingress controllers, node patching) | Zero (fully serverless container compute managed by AWS) |
| **Cloud Integration** | Requires third-party operators / complex IAM mapping | 100% native IAM roles, CloudWatch, ALB, and Secrets Manager |
| **Cold-Start Agility** | Fast if nodes are pre-warmed; slow if node autoscaling triggers | Consistent ~45s container provisioning + app initialization |
| **Team Skillset Required**| Dedicated K8s Platform / SRE specialists | Standard backend / DevOps engineers with basic cloud skills |
| **Handover Viability** | Risky to transfer to clients lacking Kubernetes expertise | Extremely high; clean Terraform / SAM infrastructure-as-code |

---

## Summary: Senior Engineer's Rule of Thumb

When evaluating whether to maintain Kubernetes or migrate to AWS ECS Fargate:

1. **Evaluate the Operational Boundary:** If your team or client does not have a 24/7 dedicated platform engineering team to manage Kubernetes upgrades and ingress controllers, **ECS Fargate provides 95% of the benefits of containerization with 5% of the maintenance overhead**.
2. **Design for Long Initialization:** For heavy machine learning workloads, configure **`HealthCheckGracePeriodSeconds`** generously (5–8 minutes) and decouple liveness from readiness probes.
3. **Protect In-Flight Compute:** Ensure load balancer deregistration delay matches or exceeds your longest possible inference execution timeout.
4. **Automate with OIDC:** Never hardcode static cloud credentials into CI/CD pipelines. Use OpenID Connect (OIDC) for short-lived, least-privilege role assumption.
5. **Never Flip a Hard Switch:** Always utilize Route 53 weighted record sets to conduct gradual 10% -> 50% -> 100% traffic migration over multiple days.
