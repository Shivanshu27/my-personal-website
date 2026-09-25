---
title: "About Me"
date: 2023-01-08T12:00:00-00:00
draft: false
---

## Professional Background

I am a Senior Software Engineer at **Tractable** (Noida), building AI-driven, cloud-native systems across AWS, GCP, and Azure. With 5+ years of experience and a B.Tech. from IIT Kanpur, I own enterprise platform work end to end — architecture, Terraform IaC, CI/CD, and production support — across engagements worth **$130M+ in client opportunity**, including a migration that secured a **$3M contract**.

Previously, I was a Senior Engineer at Evalueserve where I architected Generative AI products (RAG, multi-agent systems) and won 1st place at the Microsoft Azure Hackathon 2024. Earlier, I built real-money gaming backends at SPC Games and enterprise DevOps dashboards at GIIT Solutions.

I work remotely from New Delhi (UTC+5:30), with 4+ hours of daily overlap with US Eastern and full overlap with Europe. I'm open to senior backend/platform roles and independent contract engagements.

## Skills

### Cloud & DevOps
- **AWS**: ECS Fargate, Lambda, Step Functions, SAM/CloudFormation, S3, SNS/SQS, EventBridge, AppConfig, CloudFront, Route53, ACM, WAFv2, VPC, IAM, CloudWatch
- **GCP**: Cloud Run, Cloud KMS, Secret Manager, Artifact Registry
- **CI/CD & IaC**: Harness CI/CD, GitHub Actions (OIDC, cross-account, SSH deploy keys), Terraform
- **Containers**: Docker (distroless, BuildKit SSH mounts), Kubernetes
- **Azure**: Bare-metal server deployments

### Languages & Frameworks
- **Python**: FastAPI, Flask, Ray Serve, PyTorch, scikit-learn, NumPy, Pandas, OpenAI API
- **TypeScript / JavaScript**: Node.js, Remix v2, React 18, Next.js, Express.js, Nest.js, Vite, Web3.js, Ethers.js
- **Other**: SQL, GraphQL, Solidity, HTML/CSS

### Architecture & Patterns
Distributed Systems, Microservices, Event-driven architecture, High Availability (HA), REST APIs, Serverless, System Design, KMS envelope encryption (DEK/KEK, AES-GCM), Cross-account IAM, Zero-downtime deployments, Multi-environment CI/CD, RAG & Multi-agent AI

### Databases & Storage
PostgreSQL (JSONB), MongoDB, Redis, AWS S3

### Tools & Testing
Vitest (Unit/Integration Testing), Drizzle ORM, @react-pdf/renderer, Turbo monorepo, DecisionRules SaaS, OpenCV, CloudWatch Alarms, Mantine UI, Claude Code, Git, Bitbucket, Postman, Swagger, Figma

## Work Experience

### Senior Software Engineer
**Tractable, Noida** | May 2025 – Present

*Domain: AI-driven Insurance Tech — Auto & Property*

- **Enterprise Claim Review Migration — largest client** (secured a $3M contract)
  - Migrated the company's largest insurance client off a legacy stack onto the modern review platform; engineered an **AWS Step Functions** ingestion state machine with cross-account S3 fan-out, raising ingestion reliability from **21% to 98%**.
  - Architected a greenfield **Contention Report** with **optimistic UI** in React/Remix, server-side document generation via **@react-pdf/renderer**, and **PostgreSQL JSONB** persistence with zero DB migrations; added Rental, Tow, and Storage support.
  - Migrated the AI decision engine to a new V3 rules profile and re-authored **37 legacy rules 1:1** into **DecisionRules SaaS**; resolved estimate-parsing edge cases where inconclusive part flags blocked automated refinish calculations.
  - Delivered the platform's first **external parts-pricing capability**, diagnosing missing part-price flags across claims to recover **~$26K** of un-priced part value and avert production quoting errors.
  - Restored 3 dropped client lifecycle callbacks at byte-parity; built a standalone **Python parity engine** with a custom tooling skill, lifting cross-stack flag agreement from **72% → 88%** with **zero regressions** across 5 other insurer tenants.
- **On-Premise Vehicle Interchange Service** ($120M+ opportunity)
  - Architected and deployed a containerized vehicle interchange service on the client's own GCP Cloud Run with an end-to-end Harness CI/CD pipeline automating build, security scanning, regression, and multi-environment promotion across internal dev, client staging, and prod (100% deploy success).
  - Engineered multi-layer security with KMS envelope encryption (DEK + KEK, AES-GCM), service account impersonation, and obfuscation layers protecting 3 global VIN decoder API keys; built distroless Docker images reducing attack surface by 60%.
  - Authored Terraform IaC across 3 GCP projects (Registry, Service Accounts, IAM) and 4 log-based metrics + Cloud Monitoring dashboards tracking 100% VIN API usage, reducing manual deploy steps by 95%.
- **New Client Onboarding — Review Flow** ($5M+ new client engagement)
  - Onboarded the platform's first-ever Review Flow client with no prior knowledge transfer; raised ingestion success across 100+ production claims via version-aware artefact filtering, presigned-URL refresh, and systematic failure-mode handling.
  - Engineered cross-account S3 architecture (STS AssumeRole + org-wide bucket policy) with SNS → SQS → Lambda fan-out for bulk parallel ingestion, eliminating ~15 hrs/week of manual claim creation.
  - Built a Failed Claims display surfacing 18+ previously blocked cases (0% → 100% visibility), and configured 41 client-specific DecisionRules generating 20+ structured leakage decisions per case across labour, replace, refinish, blend, visibility, and estimate-line validations.
- **Property Automation & Estimation Services** ($8M+ product migration value)
  - Led **Kubernetes → AWS ECS Fargate** migration of 3 production ML services for an acquisition handover with zero downtime, provisioning dual-AZ private VPC networking and auto-scaling via SAM IaC.
  - Decoupled package dependencies for the transfer by migrating 5+ internal Python libraries from a self-hosted Nexus registry to **private GitHub repositories**, using scoped **SSH deploy keys** and **Docker BuildKit mounts** to prevent credential leaks in image layers.
  - Optimized a serverless **image anonymization** service (PyTorch face/plate detection) to fit AWS Lambda's **250 MB ceiling** (280 MB → 148 MB); built multi-account **GitHub Actions CI/CD** with OIDC and a Cognito admin SPA.
- **Claims Audit Automation Platform** ($1M annual leakage reduction)
  - Architected an end-to-end claims audit system combining rule-based review with **LLM-assisted claim analysis** across 5 modular pipeline stages, cutting manual audit time by **90%** (15+ hrs → 1 hr) with **92% leakage-detection accuracy** and an interactive web dashboard for adjusters.

### Senior Engineer
**Evalueserve SEZ Pvt. Ltd., Gurugram** | Dec 2023 – May 2025

*Domain: Generative AI & Enterprise SaaS*

- Architected **ComSights** — chat-based document comparison platform with RAG over complex schemas and Azure integrations, improving analyst efficiency 30%. **1st place, Microsoft Azure Hackathon 2024**.
- Built **ViSense** conference analytics platform with multilingual transcription enabling 25% faster market-intelligence processing (300+ active users).
- Shipped **PowerGen** presentation generator producing client-ready outputs in 4–6 minutes (200+ users).
- Pioneered **Genie** — AI marketplace for custom RAG and multi-agent applications.

### Backend Developer
**SPC Games, New Delhi** | Dec 2022 – Oct 2023

*Domain: Real-money Gaming Platform*

- Engineered rummy game-server sequence-finding logic and shipped admin panel with optimized MongoDB queries, boosting product-management efficiency 35%.
- Implemented cron-based selective backup system for data reliability.
- Revamped corporate site on Next.js with SEO optimizations, growing organic web traffic 20%.

### Software Engineer
**GIIT Solutions, Gurugram** | Feb 2022 – Nov 2022

*Domain: Enterprise DevOps Dashboards*

- Customized Plutora dashboards integrating JIRA/ADO/Rally pipelines, enhanced UI with Ext JS for 15% better usability, and authored Swagger-documented REST APIs.

### Blockchain & Data Science (Freelance)
**June 2021 – Dec 2021**

- **NFT Marketplace** — ERC721 Solidity contracts with Hardhat deployment and React integration, enabling 1,000+ on-chain transactions in the first month.
- Data science projects in PyTorch (image classification) and scikit-learn (credit risk).

## Education

- **B.Tech., Bioengineering** — I.I.T. Kanpur
- **Intermediate**, CBSE (CGPA 9.04/10)
- **Matriculation**, CBSE (CGPA 9.1/10)

## Achievements

- 1st place, Microsoft Azure Hackathon, Evalueserve, 2024
- Project Ranked 2, Material Science Lab, I.I.T. Kanpur
- Merit-cum-Means Scholarship, I.I.T. Kanpur
- Top 0.63% in IIT-JEE & top 0.21% in AIEEE
- International exposure — short stint in Dubai working with a 19-nationality team

## Certifications

- Full Stack Web Developer (codedamn)
- Ethereum Blockchain Developer Bootcamp with Solidity
- Data Science with Python bootcamp (Jovian)

## Outside Work

Badminton, swimming, horse riding, nature hiking, nature documentaries, and non-fiction books. Looking for fast-paced environments where I can build products that scale, add value to human life, and create revenue for the organization.
