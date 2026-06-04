# Memory: short-term, long-term & state

**Agentic AI & AI Agents** · Advanced tier · downloadable study notes

---

Agents need to remember — within a task and across sessions.

• Short-term memory = the conversation/scratchpad in the context window. It's finite, so long tasks need summarisation (compress old steps) to avoid overflow.
• Long-term memory = facts persisted outside the context (a database or vector store) and retrieved when relevant — user preferences, past decisions, learned facts.
• State = structured task progress (what's done, what's pending, intermediate results) the agent reads and updates between steps.

Patterns: write important facts to long-term memory as you go; retrieve them by similarity when needed; keep a compact running state object rather than re-deriving everything each step.

Without memory an agent repeats work and forgets context; with disciplined memory it stays coherent over long, multi-step jobs.

> The context window is short-term memory and it's finite. For long tasks, summarise old steps and persist key facts to long-term memory instead of stuffing everything into the prompt.

## Study image

Short-term context · summarisation · long-term store · state

## Checkpoint recap

1. **When a long task fills the context window, the right move is…**
   - Answer: Summarise older steps and persist key facts to long-term memory
   - Why: Summarisation + long-term storage keep the agent coherent without overflowing the finite context.

---

© W3Codify — free during launch. Generated study notes.
