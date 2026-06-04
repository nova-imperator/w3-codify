# Structured output: JSON, schemas & function calling

**Prompt Engineering** · Advanced tier · downloadable study notes

---

If your code consumes the model's output, free-form prose is a bug. Force structure.

• Ask for JSON and specify the exact schema in the prompt. Lower the temperature.
• Use the provider's structured-output / JSON mode when available — it constrains decoding so the result is always valid JSON.
• Function / tool calling is structured output in disguise: you describe functions with a JSON schema and the model returns a validated arguments object instead of text.

Always validate what comes back (e.g. with a schema validator) and handle the failure case — even constrained models occasionally drift. The combination *schema in the prompt + JSON mode + server-side validation* is what makes an LLM feature production-grade.

## Code

```json
{
  "name": "extract_invoice",
  "parameters": {
    "type": "object",
    "properties": {
      "total":   { "type": "number" },
      "currency":{ "type": "string" },
      "due_date":{ "type": "string", "format": "date" }
    },
    "required": ["total", "currency"]
  }
}
```

> Never trust raw model output. Validate against your schema server-side and define a fallback for the (rare) invalid case.

## Study image

Schema in the prompt + JSON mode + server-side validation

## Checkpoint recap

1. **The most robust way to get reliably parseable output is…**
   - Answer: Schema in the prompt + the provider's JSON/structured mode + server-side validation
   - Why: Constraining decoding to a schema and validating the result is what makes parsing dependable in production.

---

© W3Codify — free during launch. Generated study notes.
