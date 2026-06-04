# Tool use in depth

**Agentic AI & AI Agents** · Advanced tier · downloadable study notes

---

Good tools make good agents. Design them like a careful API.

• One clear job per tool, with a precise description and a tight JSON schema. The description is a prompt — say when to use it and what it returns.
• Validate arguments the model produces before executing; never trust them blindly (it's an injection surface).
• Return concise, structured results the model can reason over — not a 50KB HTML dump.
• Handle errors as data — return "no results" or an error message the model can react to, rather than throwing.
• Least privilege — give an agent only the tools it needs; gate destructive actions behind confirmation.

A dispatcher maps the model's chosen tool name to your function and runs it. Most agent bugs are bad tool design (ambiguous descriptions, fat outputs), not bad models.

> Tool arguments come from the model and can be influenced by injected content. Validate and sandbox every tool — an agent with shell or DB access is a security boundary.

## Study image

One job · tight schema · validate · concise results · least privilege

## Checkpoint recap

1. **A common cause of flaky agents is…**
   - Answer: Ambiguous tool descriptions and bloated, unstructured tool outputs
   - Why: Vague descriptions and giant outputs confuse the model; tight schemas and concise results fix most agent bugs.

---

© W3Codify — free during launch. Generated study notes.
