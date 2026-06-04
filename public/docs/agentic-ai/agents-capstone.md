# Capstone: a multi-tool agent with RAG

**Agentic AI & AI Agents** · GOD tier · downloadable study notes

---

Build a real, working agent. Pick one:

(a) Research agent — given a question, it plans, calls a web/RAG search tool (possibly several times, refining queries), grounds its answer in retrieved sources, and returns a cited summary. Add memory so follow-ups stay in context.

(b) Coding agent — given a task, it reads files (tool), proposes a change, runs tests (tool), and iterates from the results until tests pass — with a step budget and human approval before writing.

(c) Ops assistant — answers from your docs via RAG and can take one safe action behind a human-approval gate.

You're graded on: a clean agent loop with a stop condition + step budget, ≥2 well-designed tools, RAG grounding with citations, tracing of every step, and guardrails (validated tool args + approval for any risky action). The bar is an agent that completes the task reliably *and* safely — not one that works once and bankrupts you on the second run.

## Study image

Plan → tools + RAG → grounded answer, traced and guarded

## Checkpoint recap

1. **A production-grade capstone agent must include…**
   - Answer: A stop condition + budget, good tools, RAG grounding, tracing, and guardrails
   - Why: Reliable + safe completion — bounded loop, solid tools, grounding, observability, guardrails — is the bar.

---

© W3Codify — free during launch. Generated study notes.
