# Serverless at scale

**Cloud Computing** · GOD tier · downloadable study notes

---

Serverless means no servers to manage and scale-to-zero billing.

• Lambda runs functions on demand; API Gateway fronts them with HTTP.
• SQS/SNS/EventBridge decouple services with queues and events — the backbone of event-driven architecture.
• Step Functions orchestrate multi-step workflows.

The trade-offs: cold starts (first invoke latency), execution time limits, and cost that can exceed always-on compute at very high, steady throughput. Serverless wins for spiky, event-driven, low-baseline workloads; it loses for sustained high-CPU jobs.

## Study image

Lambda + API Gateway + queues/events

## Checkpoint recap

1. **Serverless (Lambda) is usually the WRONG choice for…**
   - Answer: Sustained, high-throughput, CPU-heavy processing
   - Why: At constant high load, always-on compute is cheaper and avoids cold-start/time limits.

---

© W3Codify — free during launch. Generated study notes.
