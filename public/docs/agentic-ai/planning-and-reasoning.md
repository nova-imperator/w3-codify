# Planning & multi-step reasoning

**Agentic AI & AI Agents** · Advanced tier · downloadable study notes

---

Hard goals need a plan, not just reaction. Common approaches:

• Plan-then-execute — the agent first drafts a step-by-step plan, then executes each step (calling tools), re-planning if a step fails. Good for complex, structured tasks.
• ReAct (reactive) — decide the next single action from the current state; simpler and self-correcting, but can wander.
• Decomposition — break a big goal into sub-tasks (sub-agents or sequential steps), each verifiable.
• Reflection — after acting, the agent critiques its own output and retries, which catches mistakes.

Crucial for reliability: a stop condition and a step budget. Without limits an agent can loop forever or rack up cost. Give it a max number of steps and a clear definition of "done", and prefer the simplest planning approach that solves the task.

## Study image

Plan-then-execute · ReAct · decomposition · reflection

## Checkpoint recap

1. **A must-have to stop an agent looping forever or overspending is…**
   - Answer: A stop condition + step/cost budget
   - Why: Explicit stop conditions and step/cost budgets bound an agent's loop and spend.

---

© W3Codify — free during launch. Generated study notes.
