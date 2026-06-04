# Cost, latency & caching for agents

**Agentic AI & AI Agents** · GOD tier · downloadable study notes

---

Agents are expensive by nature — many LLM calls per task. Control it deliberately.

• Fewer, better steps — good tools and clear stop conditions cut the number of loops (the main cost driver).
• Right-size models per step — a cheap model for routing/extraction, the strong model only for hard reasoning.
• Cache — reuse tool results and use prompt caching for the large static system prompt repeated every step.
• Parallelise independent tool calls instead of serialising them.
• Cap steps and tokens; stream so users see progress during long runs.

Measure cost-per-task and p95 latency, not just per-call cost — an agent that's correct but takes 40 seconds and ₹20 per request may not be shippable. Optimisation often means redesigning the loop, not swapping the model.

## Study image

Fewer steps · right-size models · cache · parallelise · cap

## Checkpoint recap

1. **The biggest cost driver in an agent is usually…**
   - Answer: The number of LLM/tool steps per task
   - Why: Each loop is an LLM call; cutting unnecessary steps (via good tools + stop conditions) cuts cost most.

---

© W3Codify — free during launch. Generated study notes.
