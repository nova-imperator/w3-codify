# Anatomy of a good prompt

**Prompt Engineering** · Basics tier · downloadable study notes

---

Reliable prompts have structure. A strong prompt usually has five parts:

1. Role — who the model should be ("You are a senior Python reviewer").
2. Instruction — the single, specific task, in the imperative.
3. Context — the data to work on, clearly delimited from the instructions.
4. Examples — one or two demonstrations of the exact behaviour you want.
5. Output format — precisely how to respond (JSON shape, length, headings).

The two biggest wins for beginners: be specific (vague prompts get vague answers) and separate instructions from data with delimiters (triple backticks, XML tags) so the model never confuses the user's content for new commands.

State the output format explicitly — "Reply with only a JSON object matching {sentiment: 'pos'|'neg'}". If you don't constrain the format, you'll get prose you can't parse.

## Code

```text
You are a strict sentiment classifier.
Classify the REVIEW as positive or negative.
Reply with ONLY one word: positive | negative.

REVIEW:
"""
The battery dies in an hour. Hugely disappointed.
"""
```

## Study image

Role · Instruction · Context · Examples · Output format

## Checkpoint recap

1. **The single most reliable way to stop a model treating user data as new instructions is…**
   - Answer: Delimit the data clearly (e.g. triple quotes / XML tags) and separate it from instructions
   - Why: Clear delimiters separate trusted instructions from untrusted content, reducing accidental instruction-following and injection.

---

© W3Codify — free during launch. Generated study notes.
