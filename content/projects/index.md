---
title: "Projects"
date: 2023-01-08T12:00:00-00:00
draft: false
---

# My Projects

A collection of professional and personal projects that demonstrate my technical skills and problem-solving abilities.

## Tractable — Cloud, AI/ML & Full-Stack

{{< project-card 
    title="RAIS On-Premise Vehicle Interchange Service ($120M+ revenue opportunity)" 
    description="Architected and deployed a containerized vehicle interchange service on client's GCP Cloud Run with end-to-end Harness CI/CD across Tractable dev, client staging, and prod (100% deploy success). Engineered multi-layer security with KMS envelope encryption (DEK + KEK, AES-GCM), service account impersonation, and obfuscation layers protecting 3 global VIN decoder API keys. Built distroless Docker images cutting attack surface by 60%, and authored Terraform IaC across 3 GCP projects with 4 log-based metrics and Cloud Monitoring dashboards, reducing manual deploy steps by 95%."
    tags="Python, Docker, GCP Cloud Run, Cloud KMS, Secret Manager, Harness CI/CD, Terraform"
    github=""
    demo=""
>}}

{{< project-card 
    title="ATIC Client Onboarding — APP Review Flow ($5M+ new client engagement)" 
    description="Onboarded ATIC as Tractable's first-ever APP Review Flow client with zero knowledge-transfer; raised ingestion success rate from 21% to 98% (+77 pp) across 100+ production claims via version-aware artefact filtering, presigned-URL refresh, and TR_081/TR_082 failure-mode handling. Architected greenfield Contention Report full-stack feature (10 React components, 6,000+ LOC, 1,300+ unit/integration tests) with server-side PDF generation via @react-pdf/renderer and zero DB migrations. Designed APP's first AWS Step Functions ingestion state machine with cross-account S3 (STS AssumeRole) and SNS to SQS to Lambda fan-out, eliminating ~15 hrs/week of manual claim creation."
    tags="TypeScript, React 18, Remix v2, Node.js, PostgreSQL (JSONB), Drizzle ORM, @react-pdf/renderer, AWS Step Functions, Lambda, S3, SNS/SQS, EventBridge, OpenCV, DecisionRules, Vitest"
    github=""
    demo=""
>}}

{{< project-card 
    title="Property Automation & Estimation Services ($8M+ product migration value)" 
    description="Led Kubernetes to AWS ECS Fargate migration of 3 production ML services for NTT client acquisition: Property Typhoon (OpenCLIP ViT-L-14-336 + Ray Serve, 934 MB model), Property Automation (FastAPI + 70+ scikit-learn models), and Image Anonymization (serverless PyTorch Lambda). Built multi-environment GitHub Actions CI/CD with OIDC auth and cross-account role assumption across 3 AWS accounts. Engineered React 18 + Vite Cognito admin SPA fronted by CloudFront + Route53 + ACM + WAFv2. Migrated 5+ private Python packages from Nexus to GitHub SSH deploy keys (ED25519, Docker BuildKit SSH mounts); optimized Lambda Layer from 280 MB to 148 MB (47%)."
    tags="Python, FastAPI, Ray Serve, PyTorch, scikit-learn, AWS ECS Fargate, Lambda, SAM, CloudFront, Route53, WAFv2, GitHub Actions OIDC, Docker BuildKit, React 18, Vite, Mantine UI, Terraform"
    github=""
    demo=""
>}}

{{< project-card 
    title="SCA Claims Audit Automation Platform ($12M+ annual leakage reduction)" 
    description="Architected end-to-end claims audit system combining rule-based NA Review pipeline with LLM-powered freestyle analysis across 5 modular pipeline stages (PDF to MPOC to S3 to Marcel API), cutting manual audit time 90% (15+ hrs to 1 hr) with 92% leakage-detection accuracy across 25+ claims and an interactive Lovable UI dashboard for stakeholder drill-down."
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
