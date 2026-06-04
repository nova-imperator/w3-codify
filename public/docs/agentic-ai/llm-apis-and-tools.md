# LLM APIs & tool/function calling

**Agentic AI & AI Agents** · Basics tier · downloadable study notes

---

An agent is an LLM that can *do things*, not just talk. The enabling primitive is tool (function) calling.

You describe a set of tools to the model — each with a name, description, and a JSON-schema of arguments. When the model decides a tool is needed, it doesn't run it; it returns a structured request ("call search with {query: 'weather Delhi'}"). Your code executes the tool and feeds the result back. The model then continues with that new information.

Key points:
• The model chooses and fills arguments; your runtime does the actual work.
• Tools turn a text predictor into something that can fetch data, run code, query a DB, or call an API.
• Clear tool descriptions and schemas are prompt engineering — vague tools get misused.

This request → execute → return loop is the heartbeat of every agent.

## Code

```json
{
  "name": "get_weather",
  "description": "Get the current weather for a city.",
  "parameters": {
    "type": "object",
    "properties": { "city": { "type": "string" } },
    "required": ["city"]
  }
}
```

> The model never runs your tools — it requests a call with arguments; your code executes it and returns the result. That boundary is also your security boundary.

## Study image

Model requests a tool → your code runs it → result returns

## Checkpoint recap

1. **When an LLM 'calls a tool', what actually happens?**
   - Answer: The model returns a structured request; your code runs the tool and returns the result
   - Why: Tool calling yields a validated arguments object; your runtime executes the tool and feeds the result back.

---

© W3Codify — free during launch. Generated study notes.
