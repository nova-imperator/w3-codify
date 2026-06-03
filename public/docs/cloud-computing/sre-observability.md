# SRE: SLOs, observability & on-call

**Cloud Computing** · GOD tier · downloadable study notes

---

Site Reliability Engineering runs systems with software discipline.

• The three pillars of observability: metrics (Prometheus), logs, and traces — together they answer "what broke and why".
• SLI (a measured signal, e.g. p99 latency) → SLO (the target, e.g. 99.9%) → error budget (the allowed failure; spend it on shipping fast or save it for stability).
• Alerting should page on *symptoms users feel* (SLO burn), not every CPU blip.
• Incident response + blameless post-mortems turn outages into permanent fixes; chaos engineering proves resilience by injecting failure on purpose.

> Error budgets resolve the dev-vs-ops fight: while budget remains, ship features; when it's burned, freeze and harden.

## Study image

Observe → define SLOs → alert on burn → learn

## Checkpoint recap

1. **An error budget is…**
   - Answer: The allowed amount of unreliability before you must stop shipping and stabilise
   - Why: It quantifies acceptable failure (1 − SLO) and governs whether to prioritise features or reliability.

---

© W3Codify — free during launch. Generated study notes.
