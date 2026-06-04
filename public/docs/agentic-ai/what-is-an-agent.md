# What is an agent? (perceive → reason → act)

**Agentic AI & AI Agents** · Basics tier · downloadable study notes

---

An agent runs a loop: perceive (read the goal + current state/observations) → reason (decide the next step) → act (call a tool) → observe the result → repeat until done.

The classic pattern is ReAct (Reason + Act): the model alternates a Thought ("I should look up X"), an Action (a tool call), and reads the Observation (tool result), looping until it can give a final answer. Interleaving reasoning with actions makes the agent self-correct from real feedback instead of hallucinating a whole plan up front.

What separates an agent from a single LLM call:
• It takes multiple steps and uses tools.
• It reacts to results (observations) between steps.
• It decides when it's done.

Start simple. Most "agent" needs are met by a tight loop with 2–3 good tools and a clear stop condition — not a sprawling autonomous system.

## Study image

Perceive → reason (Thought) → act (Action) → observe → repeat

## Checkpoint recap

1. **The ReAct pattern interleaves…**
   - Answer: Thought, Action (tool call), and Observation in a loop
   - Why: ReAct alternates reasoning and tool actions, reading observations to self-correct toward the goal.

2. **What distinguishes an agent from a single LLM call?**
   - Answer: It takes multiple tool-using steps and reacts to results until done
   - Why: Agents loop: multi-step, tool-using, reacting to observations, and deciding when to stop.

---

© W3Codify — free during launch. Generated study notes.
