# AI agents & tool use

**Machine Learning & Deep Learning** · GOD tier · downloadable study notes

---

An agent is an LLM that can call tools (functions) in a loop to accomplish multi-step tasks — exactly what powers W3Codify's own AI Tutor.

The pattern: you describe tools as JSON schemas; the model decides which to call and with what arguments; your code executes the tool and returns the result; the model continues until done. This is the function/tool-calling loop used by the Anthropic and OpenAI APIs.

Real agents need planning (decompose the task), guardrails (validate tool inputs, limit actions), and evals (measure success on a fixed task set). Without evals you can't tell if a prompt change helped or hurt.

> Never execute tool arguments blindly. Validate, sandbox, and rate-limit — an agent with shell or DB access is a security boundary.

## Study image

Model → tool call → result → repeat until done

## Checkpoint recap

1. **In a tool-calling agent, who actually executes the tool?**
   - Answer: Your application code, then returns the result to the model
   - Why: The model only *requests* a tool call with arguments; your code runs it and feeds the result back into the loop.

---

© W3Codify — free during launch. Generated study notes.
