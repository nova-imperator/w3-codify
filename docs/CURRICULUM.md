# W3Codify — Curriculum Knowledge Base

> The **real "what to teach"** for each course. Audience = people who **already know the
> fundamentals** (not first-year beginners). Every course runs the ladder
> **Index → quick Basics refresher (2–3 lessons) → ADVANCED (the bulk) → GOD (elite)**.
> Each lesson must be multi-format (text + video + a document + study image(s) + ≥1 quiz
> checkpoint) per BUILD_SPEC §6.8.1. Use this as the source content for seeding + the admin
> lesson editor. Curriculum is intentionally current to 2026 and industry-grade.

Legend per lesson: **Topics** (what's covered) · *Doc* (downloadable) · *Quiz* (checkpoint theme).

---

# 1. Machine Learning & Deep Learning
**Outcome:** ship real ML/DL systems and modern LLM apps; think like an ML engineer/researcher.
**Stack:** Python, NumPy/Pandas, scikit-learn, PyTorch, Hugging Face, Weights & Biases, FastAPI, Docker.

## Tier 0 — Basics Refresher (fast)
1. **ML mental model & the workflow** — supervised/unsupervised/RL, train/val/test split, the
   bias–variance tradeoff, overfitting/underfitting, data leakage. *Quiz:* spot the leakage.
2. **Math you actually use** — vectors/matrices, gradients & the chain rule, probability,
   distributions, expectation, maximum likelihood (intuition, not proofs). *Doc:* math cheat-sheet.
3. **Classic ML in practice** — linear/logistic regression, decision trees, random forests,
   gradient boosting (XGBoost/LightGBM), k-means, PCA; feature engineering, cross-validation,
   metrics (accuracy/precision/recall/F1/ROC-AUC/RMSE). *Quiz:* pick the right metric.

## Tier 1 — ADVANCED (Deep Learning core)
4. **Neural networks from scratch** — perceptron → MLP, activations (ReLU/GELU), forward pass,
   loss functions, **backpropagation** + gradient descent (SGD/Adam), learning-rate schedules.
5. **Training that actually converges** — initialization, batch/layer norm, dropout, weight
   decay, early stopping, gradient clipping, vanishing/exploding gradients, mixed precision.
6. **PyTorch deep-dive** — tensors, autograd, `nn.Module`, `DataLoader`, training loops,
   GPU/CUDA, checkpointing; experiment tracking with W&B. *Doc:* PyTorch reference.
7. **Computer vision / CNNs** — convolutions, pooling, classic architectures (ResNet/EfficientNet),
   transfer learning & fine-tuning, augmentation, object detection (YOLO) & segmentation overview.
8. **Sequence models → Transformers** — RNN/LSTM limits, **attention & self-attention**,
   the Transformer block, positional encodings, encoder/decoder vs decoder-only. *Quiz:* attention math intuition.
9. **NLP & embeddings** — tokenization (BPE), word/sentence embeddings, semantic search,
   classification & NER with Hugging Face `transformers`.
10. **Generative models (intro)** — autoencoders/VAEs, GANs, and diffusion models at a concept level.

## Tier 2 — GOD (LLMs, MLOps, research-grade)
11. **LLMs end-to-end** — pretraining vs fine-tuning, instruction tuning, **RLHF/DPO**,
    parameter-efficient tuning (**LoRA/QLoRA**), quantization, context windows, decoding (temp/top-p).
12. **RAG & vector databases** — chunking, embeddings, retrieval, re-ranking, evaluation;
    pgvector/Pinecone/FAISS; reducing hallucination. *Doc:* RAG architecture guide.
13. **AI agents & tool use** — function/tool calling, planning, multi-step agents, the
    Anthropic/OpenAI tool APIs, guardrails & evals (this is what powers our own AI Tutor).
14. **MLOps & production** — data/version pipelines (DVC), model serving (FastAPI/TorchServe),
    Docker + cloud deploy, monitoring, drift detection, A/B tests, feature stores, CI/CD for ML.
15. **Scaling & efficiency** — distributed training (DDP/FSDP), GPU economics, batching,
    KV-cache, inference optimization (vLLM/TensorRT), cost control.
16. **Responsible AI** — bias/fairness, evaluation beyond accuracy, privacy, prompt-injection
    defense, model cards, governance.
**Capstones:** (a) fine-tune a small LLM with LoRA on a custom dataset; (b) build a RAG-powered
assistant with citations; (c) train + deploy a vision model behind an API with monitoring.

---

# 2. Cloud Computing
**Outcome:** design, deploy, secure, and operate production cloud systems; pass the thinking
behind AWS/Azure/GCP associate→pro certs.
**Stack:** AWS-first (transferable), Linux, Docker, Kubernetes, Terraform, GitHub Actions, Prometheus/Grafana.

## Tier 0 — Basics Refresher (fast)
1. **Cloud mental model** — IaaS/PaaS/SaaS, regions/AZs, the shared-responsibility model,
   pricing/billing basics, the well-architected pillars. *Quiz:* match service → model.
2. **Linux & networking you need** — shell, processes, SSH, permissions; IP/subnets/CIDR,
   DNS, HTTP/TLS, load balancing concepts, the OSI quick map. *Doc:* networking cheat-sheet.
3. **Core building blocks** — compute (EC2), storage (S3/EBS), managed DB (RDS), IAM
   users/roles/policies, VPC basics. (Mirrors W3Codify's own infra.)

## Tier 1 — ADVANCED (build real systems)
4. **Identity & security done right** — IAM deep-dive, least privilege, roles vs users,
   policy design, secrets management (KMS/Secrets Manager), security groups vs NACLs.
5. **Networking deep-dive** — VPC design, public/private subnets, NAT, route tables,
   peering, VPN, load balancers (ALB/NLB), CloudFront/CDN, Route 53. *Quiz:* design a 3-tier VPC.
6. **Compute & containers** — autoscaling, AMIs, **Docker** images/registries, ECS/Fargate,
   intro to **Kubernetes** (pods/deployments/services/ingress). *Doc:* Docker + K8s primer.
7. **Kubernetes in depth** — config/secrets, HPA, rolling/canary deploys, Helm, health checks,
   resource limits, observability hooks. *Quiz:* debug a CrashLoopBackOff.
8. **Databases & storage at scale** — RDS/Aurora, read replicas, caching (Redis/ElastiCache),
   S3 lifecycle/versioning, DynamoDB & NoSQL patterns, backups & PITR.
9. **Infrastructure as Code** — **Terraform** (providers, state, modules, workspaces) and
   CloudFormation; immutable infra, drift. *Doc:* Terraform module template.
10. **CI/CD & DevOps** — GitHub Actions pipelines, build→test→deploy, blue/green, artifact
    registries, deploying to EC2/ECS/K8s (exactly like W3Codify's own deploy).

## Tier 2 — GOD (architect & operate at scale)
11. **Serverless & event-driven** — Lambda, API Gateway, SQS/SNS/EventBridge, step functions,
    cold starts, when serverless wins vs loses.
12. **High-availability architecture** — multi-AZ & **multi-region**, failover, disaster
    recovery (RTO/RPO), global data, edge. *Doc:* HA reference architecture.
13. **Observability & SRE** — metrics/logs/traces, Prometheus + Grafana, CloudWatch, SLO/SLI/error
    budgets, alerting, incident response, chaos engineering intro.
14. **Security & compliance at scale** — zero-trust, WAF, GuardDuty, encryption everywhere,
    audit (CloudTrail), compliance frameworks, threat modeling cloud apps.
15. **FinOps & cost engineering** — right-sizing, spot/reserved/savings plans, tagging,
    budgets/alerts, architecture-driven cost cuts. *Quiz:* cut a bill by 40%.
16. **Platform engineering** — internal developer platforms, GitOps (ArgoCD), service meshes,
    multi-account/landing zones.
**Capstones:** (a) Terraform a full VPC + autoscaled app + RDS; (b) deploy a containerized app to
K8s with CI/CD, HPA, and Grafana dashboards; (c) design + document a multi-region HA system.

---

# 3. Cyber Security
**Outcome:** think offensively and defensively; secure real apps, networks, and cloud; work
toward roles in AppSec, pentesting, blue team, and cloud security. **Ethics/authorization first.**
**Stack:** Linux/Kali, Burp Suite, Wireshark, nmap, Metasploit (lab-only), Python, cloud security tooling.

## Tier 0 — Basics Refresher (fast)
1. **Security mindset & CIA triad** — confidentiality/integrity/availability, threat actors,
   attack surface, defense-in-depth, **legal & ethical boundaries / authorization**. *Quiz:* legal vs illegal.
2. **Networking & systems for security** — TCP/IP, ports/protocols, DNS, TLS, the OSI model
   as layered defense; Linux hardening basics. *Doc:* protocol/port cheat-sheet.
3. **Cryptography essentials** — symmetric vs asymmetric, hashing vs encryption, TLS/PKI,
   password storage (bcrypt/argon2), common crypto mistakes. *Quiz:* hash vs encrypt.

## Tier 1 — ADVANCED (offensive + defensive core)
4. **Web app security & OWASP Top 10** — injection (SQLi), XSS, CSRF, auth/session flaws,
   access control, SSRF, security misconfig; hands-on in a deliberately vulnerable lab. *Quiz:* identify the vuln.
5. **Burp Suite & web pentesting** — proxying, repeater/intruder, finding & exploiting web bugs
   ethically, reporting. *Doc:* web pentest methodology.
6. **Network security & recon** — nmap scanning, enumeration, Wireshark traffic analysis,
   firewalls/IDS/IPS, segmentation, VPNs. *Quiz:* read a pcap.
7. **Authentication & access** — OAuth/OIDC, JWT pitfalls, MFA, SSO, session management,
   zero-trust principles. (Ties to W3Codify's own auth.)
8. **System & endpoint security** — privilege escalation (Linux/Windows) concepts, malware
   categories, EDR, logging, patch management.
9. **Blue team & detection** — SIEM, log analysis, the **MITRE ATT&CK** framework, detection
   engineering, threat intel basics. *Doc:* ATT&CK quick map.
10. **Secure coding / DevSecOps** — input validation, secrets handling, dependency/SCA scanning,
    SAST/DAST, securing CI/CD pipelines. *Quiz:* fix the insecure code.

## Tier 2 — GOD (elite offense, defense & cloud)
11. **Red team operations** — the attack lifecycle (recon→initial access→privesc→lateral
    movement→exfil), C2 concepts, evasion **(lab-only, authorized)**, purple teaming.
12. **Exploit development (intro)** — buffers/memory, how exploits work, shellcode concepts,
    modern mitigations (ASLR/DEP), responsible disclosure. *Doc:* disclosure playbook.
13. **Cloud security** — securing AWS/Azure/GCP, IAM attack paths, misconfig hunting,
    container/K8s security, CSPM, the cloud shared-responsibility model. *Quiz:* find the misconfig.
14. **Application security at scale** — threat modeling (STRIDE), API security, supply-chain
    security (SBOM), bug-bounty methodology, secure SDLC.
15. **Incident response & forensics** — IR lifecycle, triage, memory/disk forensics intro,
    containment & recovery, post-mortems. *Doc:* IR runbook.
16. **Threat hunting & advanced detection** — hypothesis-driven hunting, anomaly detection,
    adversary emulation, building detections from ATT&CK.
**Capstones:** (a) full authorized web-app pentest with a professional report; (b) build a
detection lab (SIEM + ATT&CK detections) and catch a simulated attack; (c) audit a cloud account
and remediate misconfigurations.

> **Ethics banner (must appear in the Cyber course):** all offensive techniques are taught for
> **authorized, legal, defensive** purposes only — labs are isolated and consented. No targeting
> of real systems without written authorization.

---

## How to turn this into lessons (for the build/admin)
- Each numbered item ≈ one lesson; each lesson = **text explainer + a short video + a downloadable
  doc + study image(s) + ≥1 quiz checkpoint** (BUILD_SPEC §6.8.1).
- Tag lessons to the tier (**Basics / Advanced / GOD**) for the curriculum ladder + tier emblems.
- End each tier with a **mini-assessment**; end each course with a **final assessment → certificate**.
- Keep everything **free** for now (launch offer) — pricing flips via admin later.
- This is a starting top-level map; admins extend it course-by-course in `/admin` with no code changes.
