---
title: "About Me"
date: 2023-01-08T12:00:00-00:00
draft: false
---

## Professional Background

I am a Senior Software Engineer at **Tractable** (Noida), building AI-driven, cloud-native systems across AWS, GCP, and Azure. With 5+ years of experience and a B.Tech. from IIT Kanpur, I architect full-stack and ML platforms that translate into measurable revenue — currently driving **$140M+ in client opportunities** at Tractable through greenfield product features, secure infrastructure-as-code, and zero-downtime cloud migrations.

Previously, I was a Senior Engineer at Evalueserve where I architected Generative AI products (RAG, multi-agent systems) and won 1st place at the Microsoft Azure Hackathon 2024. Earlier, I built real-money gaming backends at SPC Games and enterprise DevOps dashboards at GIIT Solutions.

## Skills

### Cloud & DevOps
- **AWS**: ECS Fargate, Lambda, Step Functions, SAM/CloudFormation, S3, SNS/SQS, EventBridge, AppConfig, CloudFront, Route53, ACM, WAFv2, VPC, IAM, CloudWatch
- **GCP**: Cloud Run, Cloud KMS, Secret Manager, Artifact Registry
- **CI/CD & IaC**: Harness CI/CD, GitHub Actions (OIDC, cross-account, SSH deploy keys), Terraform
- **Containers**: Docker (distroless, BuildKit SSH mounts)
- **Azure**: Bare-metal server deployments

### Languages & Frameworks
- **Python**: FastAPI, Flask, Ray Serve, PyTorch, scikit-learn, NumPy, Pandas, OpenAI API
- **TypeScript / JavaScript**: Node.js, Remix v2, React 18, Next.js, Express.js, Nest.js, Vite, Web3.js, Ethers.js
- **Other**: SQL, GraphQL, Solidity, HTML/CSS

### Architecture & Patterns
Distributed Systems, Microservices, Event-driven architecture, High Availability (HA), REST APIs, Serverless, KMS envelope encryption (DEK/KEK, AES-GCM), Cross-account IAM, Zero-downtime deployments, Multi-environment CI/CD, RAG & Multi-agent AI

### Databases & Storage
PostgreSQL (JSONB), MongoDB, Redis, AWS S3

### Tools & Testing
Vitest (Unit/Integration Testing), Drizzle ORM, @react-pdf/renderer, Turbo monorepo, DecisionRules SaaS, OpenCV, CloudWatch Alarms, Mantine UI, Lovable UI, Claude Code, Git, Bitbucket, Postman, Swagger, Figma

## Work Experience

### Senior Software Engineer
**Tractable, Noida** | May 2025 – Present

*Domain: AI-driven Insurance Tech — Auto & Property*

- **GEICO Subro Migration – APP Review Pipeline** ($3M+ deal, APP's largest client)
  - Migrated **GEICO Subro -- APP's largest client** onto the modern APP Review pipeline from legacy KTLO; engineered an **AWS Step Functions** ingestion state machine with cross-account S3 fan-out, raising ingestion reliability from **21% to 98%**.
  - Architected greenfield **Contention Report** with **optimistic UI** in React/Remix, server-side document generation via **@react-pdf/renderer**, and **PostgreSQL JSONB** persistence with zero DB migrations; added Rental, Tow, and Storage support.
  - Migrated the AI decision engine to the `GEICO_SUBRO_CAND` V3 profile and re-authored **37 legacy rules 1:1** into **DecisionRules SaaS**; resolved CCC estimate parsing edge cases where inconclusive part flags blocked automated refinish calculations.
  - Delivered APP's first **external parts-pricing capability** (PartsTrader via Repair Data Service), diagnosing missing part-price flags across CCC claims to recover **~$26K** of un-priced part value and avert production quoting errors.
  - Restored 3 dropped client lifecycle callbacks at byte-parity; built a standalone **Python parity engine** published as interactive **Claude artefacts** with a custom skill, lifting cross-stack flag agreement from **72% → 88%** with **zero regressions** to 5 other insurer tenants.
- **RAIS On-Premise Vehicle Interchange Service** ($120M+ revenue opportunity)
  - Architected and deployed a containerized vehicle interchange service on client's GCP Cloud Run with end-to-end Harness CI/CD pipeline automating build, security scanning, regression, and multi-environment promotion across Tractable dev, client staging, and prod (100% deploy success).
  - Engineered multi-layer security with KMS envelope encryption (DEK + KEK, AES-GCM), service account impersonation, and obfuscation layers protecting 3 global VIN decoder API keys; built distroless Docker images reducing attack surface by 60%.
  - Authored Terraform IaC across 3 GCP projects (Registry, Service Accounts, IAM) and 4 log-based metrics + Cloud Monitoring dashboards tracking 100% VIN API usage, reducing manual deploy steps by 95%.
- **ATIC Client Onboarding – APP Review Flow** ($5M+ new client engagement)
  - Onboarded ATIC as Tractable's first-ever APP Review Flow client with zero knowledge-transfer; raised ingestion success rate from **21% → 98% (+77 pp)** across 100+ production claims via version-aware artefact filtering, presigned-URL refresh, and TR_081/TR_082 failure-mode handling.
  - Engineered cross-account S3 architecture (STS AssumeRole + org-wide bucket policy) with SNS → SQS → Lambda fan-out for bulk parallel ingestion, eliminating ~15 hrs/week of manual claim creation.
  - Built Failed Claims display surfacing 18+ previously blocked cases (0% → 100% visibility), and configured 41 ATIC-specific DecisionRules generating 20+ structured leakage decisions per case across labour, replace, refinish, blend, visibility, and estimate-line validations.
- **Property Automation & Estimation Services** ($8M+ product migration value)
  - Led **Kubernetes → AWS ECS Fargate** migration of 3 production ML services for NTT handover (**Property Typhoon**, **Property Automation**, **Image Anonymization**) with zero downtime, provisioning dual-AZ private VPC networking and auto-scaling via SAM IaC.
  - Decoupled package dependencies for NTT transfer by migrating 5+ internal Python libraries from Sonatype Nexus to **private GitHub repositories**, using scoped **SSH deploy keys** and **Docker BuildKit mounts** to prevent credential leaks in image layers.
  - Optimized serverless **Image Anonymization** (PyTorch face/plate detection) to fit AWS Lambda's **250 MB ceiling** (280 MB → 148 MB); built multi-account **GitHub Actions CI/CD** with OIDC and Cognito admin SPA.
- **SCA Claims Audit Automation Platform** ($1M annual leakage reduction)
  - Architected end-to-end claims audit system combining rule-based review with **LLM-assisted claim analysis** across 5 modular pipeline stages (PDF → MPOC → S3 → internal APIs), cutting manual audit time by **90%** (15+ hrs → 1 hr) with **92% leakage-detection accuracy** and an interactive web dashboard for adjusters.

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
- Top 0.63% in IIT-JEE & top 0.21% in AIEEE; 99.9+ percentile in UPSC CSAT
- International exposure — short stint in Dubai working with a 19-nationality team

## Certifications

- Full Stack Web Developer (codedamn)
- Ethereum Blockchain Developer Bootcamp with Solidity
- Data Science with Python bootcamp (Jovian)

## Outside Work

Badminton, swimming, horse riding, nature hiking, nature documentaries, and non-fiction books. Looking for fast-paced environments where I can build products that scale, add value to human life, and create revenue for the organization.
