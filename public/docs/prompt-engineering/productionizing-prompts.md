# Productionizing: versioning, A/B & observability

**Prompt Engineering** · GOD tier · downloadable study notes

---

A prompt in production is a piece of software and deserves the same rigour.

• Version prompts in source control (not hard-coded inline); tag which version served each response so you can reproduce and roll back.
• A/B test prompt changes on real traffic and compare on your metric before full rollout — exactly like a code deploy.
• Observability — log inputs, outputs, token counts, latency, cost, and failures. Sample and review. Watch for drift as the provider updates models.
• Guard the model upgrade — a new model version can silently change behaviour; re-run your eval set before switching.

The teams who ship reliable LLM features treat prompts as versioned, tested, monitored artifacts — not strings someone tweaked in the demo.

> Before switching to a newer model, re-run your eval set. 'It's a better model' has broken many prompts that quietly depended on the old one's quirks.

## Study image

Version → A/B → observe → re-eval on model upgrades

## Checkpoint recap

1. **Before upgrading to a newer model version in production you should…**
   - Answer: Re-run your eval set to catch behaviour changes
   - Why: Model upgrades can silently change behaviour; the eval set tells you whether your prompts still hold.

---

© W3Codify — free during launch. Generated study notes.
