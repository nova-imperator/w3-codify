# Cost & security engineering

**Cloud Computing** · GOD tier · downloadable study notes

---

FinOps — engineering for cost:
• Right-size instances; kill idle resources.
• Use spot (cheap, interruptible), reserved/savings plans (commit for discounts).
• Tag everything for cost attribution; set budgets + alerts.
• The biggest savings are architectural (serverless, caching, lifecycle tiers), not penny-pinching.

Security at scale:
• Zero-trust — never trust the network; authenticate every request.
• WAF and GuardDuty for threat detection; encryption everywhere (at rest + in transit).
• CloudTrail audits every API call.
• Threat-model your architecture, not just your code.

> The fastest way to cut a cloud bill 40% is usually architectural — right-sizing + spot + caching + S3 lifecycle — not turning off dev boxes.

## Study image

Right-size + spot + tag; zero-trust + encrypt + audit

## Checkpoint recap

1. **Which compute pricing is cheapest but can be reclaimed at short notice?**
   - Answer: Spot
   - Why: Spot instances offer the deepest discount in exchange for possible interruption — ideal for fault-tolerant work.

---

© W3Codify — free during launch. Generated study notes.
