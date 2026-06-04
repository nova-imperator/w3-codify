# Agent frameworks (LangGraph / Agents SDK)

**Agentic AI & AI Agents** · Advanced tier · downloadable study notes

---

You can hand-roll the loop, but frameworks handle the plumbing so you focus on tools and logic.

• LangGraph models an agent as a graph/state machine — nodes are steps (LLM call, tool, decision), edges are transitions. Great for explicit control flow, branching, loops, and human-in-the-loop pauses.
• OpenAI Agents SDK — a lightweight runtime for tool-using agents with handoffs between agents, built-in tracing, and guardrails.
• Others (CrewAI, AutoGen) focus on multi-agent collaboration.

What frameworks give you: the agent loop, tool wiring, state/memory management, tracing/observability, retries, and human approval steps. What they don't give you: good tool design and a clear task definition — that's still on you.

Start with the agent loop you understand; reach for a framework when you need durable state, branching control flow, or team-of-agents orchestration.

## Code

```python
# LangGraph-style sketch: a tiny state machine
def reason(state):  ...   # LLM picks the next action
def act(state):     ...   # run the chosen tool, append observation
def done(state):    return state["answer"] is not None

# loop: reason -> act -> (done? stop : reason) with a step budget
```

## Study image

Nodes = steps, edges = transitions, with tracing + human-in-the-loop

## Checkpoint recap

1. **LangGraph models an agent primarily as…**
   - Answer: A graph/state machine of steps with explicit transitions
   - Why: LangGraph expresses agents as state machines, giving explicit control flow, branching, and human-in-the-loop.

---

© W3Codify — free during launch. Generated study notes.
