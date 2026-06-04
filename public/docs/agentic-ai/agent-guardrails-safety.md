# Guardrails, safety & human-in-the-loop

**Agentic AI & AI Agents** · GOD tier · downloadable study notes

---

An agent that can *act* can act badly — delete data, leak secrets, get hijacked by injected content. Safety is non-negotiable.

• Least privilege — minimum tools and scopes; read-only where possible.
• Human-in-the-loop — require explicit approval before high-impact, irreversible actions (sending money, deleting, emailing customers). The agent proposes; a human confirms.
• Input/output guardrails — validate tool arguments, screen for prompt injection (including indirect, from tool/RAG output), and check outputs against policy.
• Sandboxing — run code/tools in isolated environments with no ambient credentials.
• Budgets & kill-switch — cap steps/cost and allow an operator to stop a run.

Treat the agent as an untrusted, easily-influenced actor with real powers. Defense in depth — separation, validation, approval gates, sandboxing — is what makes autonomy safe enough to ship.

> For any irreversible or high-impact action (payments, deletes, outbound email), require human approval. The agent proposes; a person confirms.

## Study image

Least privilege · human approval · validate · sandbox · budgets

## Checkpoint recap

1. **Before an agent performs an irreversible, high-impact action you should…**
   - Answer: Require human-in-the-loop approval
   - Why: High-impact, irreversible actions warrant explicit human approval — the agent proposes, a human confirms.

---

© W3Codify — free during launch. Generated study notes.
