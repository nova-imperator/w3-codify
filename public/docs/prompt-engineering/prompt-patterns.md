# Prompt patterns that work

**Prompt Engineering** · Advanced tier · downloadable study notes

---

A handful of reusable patterns cover most production prompts:

• Persona — assign an expert role to set tone and raise the bar ("You are a meticulous editor").
• Delimiters — wrap inputs in triple backticks or XML tags so data and instructions never blur.
• Decomposition — split a big task into smaller prompts/steps (extract → transform → format) instead of one mega-prompt. Each step is easier to test and debug.
• Output priming — end the prompt with the start of the expected answer (e.g. {) to nudge format.
• Refusal & "I don't know" — explicitly permit the model to say it doesn't know, which cuts confident wrong answers.

Patterns compose. A robust prompt is often persona + delimited context + decomposition + a strict output format + an explicit "if unsure, say so".

## Study image

Persona · delimiters · decomposition · priming · refusal

## Checkpoint recap

1. **Breaking one complex prompt into extract → transform → format steps is an example of…**
   - Answer: Decomposition
   - Why: Decomposition splits a hard task into smaller, testable steps that are easier to debug and make reliable.

---

© W3Codify — free during launch. Generated study notes.
