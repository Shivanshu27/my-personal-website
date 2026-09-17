---
title: "Projects"
date: 2023-01-08T12:00:00-00:00
draft: false
---

# My Projects

A collection of professional and personal projects that demonstrate my technical skills and problem-solving abilities.

## Tractable — Cloud, AI/ML & Full-Stack

{{< project-card 
    title="GEICO Subro Migration — APP Review Pipeline ($3M+ deal, APP's largest client)" 
    description="Migrated GEICO's Subrogation claim-review platform off legacy KTLO stack onto modern Auto Platform across 5 repos."
    bullets="Migrated <strong>GEICO Subro -- APP's largest client</strong> onto modern Auto Platform from legacy KTLO; engineered an <strong>AWS Step Functions</strong> ingestion state machine with cross-account S3 fan-out, raising ingestion reliability from <strong>21% to 98%</strong>. | Architected greenfield <strong>Contention Report</strong> with optimistic UI in React/Remix, server-side dynamic PDF generation (@react-pdf/renderer), and schema-less JSONB persistence with <strong>zero DB migrations</strong>; expanded with a dedicated Rental/Tow/Storage contention calculator. | Re-authored 37 legacy in-process rules 1:1 into <strong>DecisionRules SaaS</strong> under the GEICO_SUBRO_CAND V3 profile, resolving CCC estimate parsing edge cases where inconclusive parts blocked automated refinish calculations. | Delivered APP's first external parts-pricing capability (<strong>PartsTrader</strong> via Repair Data Service), diagnosing missing part-price flags across CCC claims to recover <strong>~$26K</strong> in unpriced parts and avert production quoting errors. | Restored 3 dropped client lifecycle callbacks at byte-parity; built a standalone <strong>Python parity engine</strong> published as interactive <strong>Claude artefacts</strong> with a custom skill, lifting cross-stack flag agreement from <strong>72% → 88%</strong> with zero regression across 5 other insurer tenants."
    tags="TypeScript, React 18, Remix v2, Node.js, Python, PostgreSQL (JSONB), Drizzle ORM, AWS Step Functions, Lambda, S3, SNS/SQS, EventBridge, STS, DecisionRules SaaS, PartsTrader, Vitest"
    github=""
    demo=""
>}}

{{< project-card 
    title="RAIS On-Premise Vehicle Interchange Service ($120M+ revenue opportunity)" 
    description="Containerized vehicle interchange service deployed on client's GCP Cloud Run with end-to-end Harness CI/CD and multi-layer security."
    bullets="Architected and deployed the service across Tractable dev, client staging, and prod with end-to-end Harness CI/CD pipeline automating build, security scanning, regression, and multi-environment promotion (100% deploy success). | Engineered multi-layer security with <strong>KMS envelope encryption (DEK + KEK, AES-GCM)</strong>, service account impersonation, and obfuscation layers protecting 3 global VIN decoder API keys; built distroless Docker images reducing attack surface by 60%. | Authored Terraform IaC across 3 GCP projects (Registry, Service Accounts, IAM) and 4 log-based metrics + Cloud Monitoring dashboards tracking 100% VIN API usage, reducing manual deploy steps by 95%."
    tags="Python, Docker, GCP Cloud Run, Cloud KMS, Secret Manager, Harness CI/CD, Terraform"
    github=""
    demo=""
>}}

{{< project-card 
    title="ATIC Client Onboarding — APP Review Flow ($5M+ new client engagement)" 
    description="Onboarded ATIC as Tractable's first-ever APP Review Flow client with zero knowledge-transfer."
    bullets="Raised ingestion success rate from <strong>21% → 98% (+77 pp)</strong> across 100+ production claims via version-aware artefact filtering, presigned-URL refresh, and TR_081/TR_082 failure-mode handling. | Engineered cross-account S3 architecture (STS AssumeRole + org-wide bucket policy) with SNS → SQS → Lambda fan-out for bulk parallel ingestion, eliminating ~15 hrs/week of manual claim creation. | Built Failed Claims display surfacing 18+ previously blocked cases (0% → 100% visibility), and configured 41 ATIC-specific DecisionRules generating 20+ structured leakage decisions per case."
    tags="TypeScript, React 18, Remix v2, Node.js, PostgreSQL (JSONB), Drizzle ORM, @react-pdf/renderer, AWS Step Functions, Lambda, S3, SNS/SQS, EventBridge, OpenCV, DecisionRules, Vitest"
    github=""
    demo=""
>}}

{{< project-card 
    title="Property Automation & Estimation Services ($8M+ product migration value)" 
    description="Led Kubernetes → AWS ECS Fargate migration of 3 production ML services for NTT client acquisition."
    bullets="Led <strong>Kubernetes → AWS ECS Fargate</strong> migration of 3 production ML services for NTT acquisition (<strong>Property Typhoon</strong> with OpenCLIP ViT-L-14-336 + Ray Serve, <strong>Property Automation</strong> with FastAPI + 70+ scikit-learn models, and <strong>Image Anonymization</strong> with serverless PyTorch Lambda) — zero-downtime via SAM IaC with auto-scaling, Service Discovery, and dual-AZ private VPC. | Built multi-environment GitHub Actions CI/CD with OIDC auth, cross-account role assumption (3 AWS accounts), and React 18 + Vite Cognito admin SPA with Terraform IaC. | Decoupled package dependencies for NTT transfer by migrating 5+ internal Python libraries from Sonatype Nexus to <strong>private GitHub repositories</strong>, using scoped <strong>SSH deploy keys</strong> and <strong>Docker BuildKit mounts</strong> to prevent credential leaks. | Optimized serverless <strong>Image Anonymization</strong> to fit AWS Lambda's <strong>250 MB ceiling</strong> (280 MB → 148 MB)."
    tags="Python, FastAPI, Ray Serve, PyTorch, scikit-learn, AWS ECS Fargate, Lambda, SAM, CloudFront, Route53, WAFv2, GitHub Actions OIDC, Docker BuildKit, React 18, Vite, Mantine UI, Terraform"
    github=""
    demo=""
>}}

{{< project-card 
    title="SCA Claims Audit Automation Platform ($1M annual leakage reduction)" 
    description="End-to-end claims audit system combining rule-based review with LLM-assisted claim analysis."
    bullets="5 modular pipeline stages: PDF → MPOC → S3 → Marcel API. | Cut manual audit time <strong>90%</strong> (15+ hrs → 1 hr) with <strong>92% leakage-detection accuracy</strong> across 25+ historical claims. | Interactive Lovable UI dashboard for stakeholder drill-down into AI-flagged leakage across labour, parts, and visibility categories."
    tags="Python, Flask, OpenAI API, AWS S3, Lovable UI, MPOC Platform"
    github=""
    demo=""
>}}

## Evalueserve — Generative AI & Enterprise SaaS

{{< project-card 
    title="ComSights — Document Comparison Platform" 
    description="Architected a chat-based document comparison platform with RAG over complex schemas and Azure integrations, improving analyst efficiency by 30%. Won 1st place at Microsoft Azure Hackathon 2024."
    tags="PostgreSQL, Azure, Firebase, RAG, TypeScript, React.js, Node.js"
    github=""
    demo=""
>}}

{{< project-card 
    title="ViSense — Conference Analytics Platform" 
    description="Conference analytics platform with multilingual Assembly AI transcription enabling 25% faster market-intelligence processing, supporting 300+ active users."
    tags="Assembly AI, Node.js, React.js, Azure, Docker"
    github=""
    demo=""
>}}

{{< project-card 
    title="PowerGen — Presentation Generation Platform" 
    description="Pioneered an AI-driven presentation generator producing client-ready outputs in 4–6 minutes (200+ users), automating data extraction and intelligent templating."
    tags="Node.js, React.js, Azure, PostgreSQL, Python, SERP API"
    github=""
    demo=""
>}}

{{< project-card 
    title="Genie — AI Marketplace Platform" 
    description="A one-stop marketplace for custom RAG and multi-agent AI applications, enabling rapid productization of internal LLM workflows."
    tags="LangFlow, Multi-agent AI, RAG, Python"
    github=""
    demo=""
>}}

## Gaming & Web Applications

{{< project-card 
    title="Rummy Game Server & Admin Panel (SPC Games)" 
    description="Engineered rummy game-server sequence-finding logic and shipped admin panel with optimized MongoDB queries, boosting product-management efficiency by 35%. Implemented cron-based selective backup system for data reliability."
    tags="TypeScript, Node.js, Express.js, MongoDB, RabbitMQ, jQuery, EJS"
    github=""
    demo=""
>}}

{{< project-card 
    title="Corporate Site Revamp on Next.js (SPC Games)" 
    description="Revamped corporate website on Next.js with SEO optimizations, growing organic web traffic by 20%."
    tags="Next.js, React, SEO"
    github=""
    demo=""
>}}

## Enterprise DevOps Dashboards

{{< project-card 
    title="Plutora Dashboards (GIIT Solutions)" 
    description="Customized Plutora dashboards integrating JIRA/ADO/Rally pipelines, enhanced UI with Ext JS for 15% better usability, and authored Swagger-documented REST APIs."
    tags="TypeScript, Node.js, Ext JS, REST APIs, Swagger"
    github=""
    demo=""
>}}

## Blockchain Projects

{{< project-card 
    title="NFT Marketplace" 
    description="Developed ERC721 NFT smart contracts deployed via Hardhat and integrated with a React frontend using ethers.js — enabling 1,000+ on-chain transactions in the first month."
    tags="Solidity, Hardhat, Web3.js, Ethers.js, React"
    github=""
    demo=""
>}}

## Data Science Projects

{{< project-card 
    title="Best Artworks Image Classification" 
    description="Trained a PyTorch CNN/ResNet on a 50-class imbalanced art-images dataset, lifting accuracy from 43% to 65%."
    tags="Python, PyTorch, CNN, ResNet, Computer Vision"
    github=""
    demo="https://jovian.ai/shivanshusingla27/deep-learning-project-3"
>}}

{{< project-card 
    title="Home Credit Default Risk" 
    description="Benchmarked Logistic Regression, Decision Tree, Random Forest, and XGBM classifiers with hyperparameter tuning, achieving 86% accuracy."
    tags="Python, Scikit-learn, Pandas, Machine Learning"
    github=""
    demo="https://jovian.ai/shivanshusingla27/my-ml-project1"
>}}
