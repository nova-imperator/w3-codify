# Cost, latency & model selection

**Prompt Engineering** · GOD tier · downloadable study notes

---

Reliable LLM features are also cheap and fast. The levers:

• Right-size the model. Use a small/cheap model for easy tasks (classification, extraction) and reserve the big model for hard reasoning. A router can pick per request.
• Trim tokens. Shorter prompts and outputs cost less and run faster — cut redundant instructions, summarise long context, cap max output tokens.
• Caching. Cache identical or templated requests; use the provider's prompt caching to reuse a large static system prompt across calls at a discount.
• Stream responses so users see output immediately even when total latency is high.
• Batch offline work.

Measure cost-per-task and p95 latency the way you measure accuracy — a feature that's right but too slow or expensive doesn't ship.

## Study image

Right-size · trim tokens · cache · stream · batch

## Checkpoint recap

1. **A cheap, high-impact way to cut cost on a fixed large system prompt reused across calls is…**
   - Answer: Prompt caching
   - Why: Prompt caching reuses a large static prefix across requests at a discount, cutting cost and latency.

---

© W3Codify — free during launch. Generated study notes.
