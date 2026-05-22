---
title: "About Me"
date: 2023-01-08T12:00:00-00:00
draft: false
---

## Professional Background

I am a Software Engineer at **Tractable** (Noida), building AI-driven, cloud-native systems across AWS, GCP, and Azure. With 5+ years of experience and a B.Tech. from IIT Kanpur, I architect full-stack and ML platforms that translate into measurable revenue — currently driving **$140M+ in client opportunities** at Tractable through greenfield product features, secure infrastructure-as-code, and zero-downtime cloud migrations.

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
Microservices, REST APIs, Event-driven systems, Serverless, KMS envelope encryption (DEK/KEK, AES-GCM), Cross-account IAM, Zero-downtime deployments, Multi-environment CI/CD, RAG & Multi-agent AI

### Databases & Storage
PostgreSQL (JSONB), MongoDB, Redis, AWS S3

### Tools & Testing
Drizzle ORM, @react-pdf/renderer, Turbo monorepo, Vitest, OpenCV, DecisionRules SaaS, Mantine UI, Lovable UI, Git, Bitbucket, Postman, Swagger, Figma

## Work Experience

### Software Engineer
**Tractable, Noida** | May 2025 – Present

- **RAIS On-Premise Vehicle Interchange Service** ($120M+ revenue opportunity) — Architected a containerized service on GCP Cloud Run with end-to-end Harness CI/CD; engineered multi-layer security with KMS envelope encryption (DEK + KEK, AES-GCM) protecting 3 global VIN decoder API keys; authored Terraform IaC across 3 GCP projects, reducing manual deploy steps by 95%.
- **ATIC Client Onboarding – APP Review Flow** ($5M+ new client engagement) — Onboarded ATIC as Tractable's first-ever APP Review Flow client; raised ingestion success rate from **21% → 98% (+77 pp)** across 100+ production claims. Architected greenfield **Contention Report** full-stack feature (10 React components, 6,000+ LOC, 1,300+ tests, server-side PDF generation via @react-pdf/renderer, zero DB migrations). Designed APP's first AWS Step Functions ingestion state machine with cross-account S3 (STS AssumeRole) and SNS → SQS → Lambda fan-out, eliminating ~15 hrs/week of manual work.
- **Property Automation & Estimation Services** ($8M+ product migration value) — Led Kubernetes → AWS ECS Fargate migration of 3 production ML services (Property Typhoon with OpenCLIP ViT-L-14-336 + Ray Serve, Property Automation with 70+ scikit-learn models, Image Anonymization on serverless PyTorch Lambda) for NTT client acquisition. Built multi-account GitHub Actions OIDC CI/CD, migrated 5+ private Python packages from Nexus to GitHub SSH deploy keys, optimized Lambda Layer 280 MB → 148 MB (47%).
- **SCA Claims Audit Automation Platform** ($12M+ annual leakage reduction) — Architected end-to-end claims audit system combining rule-based NA Review pipeline with LLM-powered freestyle analysis (OpenAI API) across 5 modular pipeline stages, cutting manual audit time **90%** (15+ hrs → 1 hr) with 92% leakage-detection accuracy.

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
- Top 0.63% in IIT-JEE & top 0.21% in AIEEE 2009; 99.9+ percentile in UPSC
- International exposure — short stint in Dubai working with a 19-nationality team

## Certifications

- Full Stack Web Developer (codedamn)
- Ethereum Blockchain Developer Bootcamp with Solidity
- Data Science with Python bootcamp (Jovian)

## Outside Work

Badminton, swimming, horse riding, nature hiking, nature documentaries, and non-fiction books. Looking for fast-paced environments where I can build products that scale, add value to human life, and create revenue for the organization.
