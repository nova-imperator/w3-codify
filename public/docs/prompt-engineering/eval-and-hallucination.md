# Evaluating prompts & cutting hallucination

**Prompt Engineering** · Advanced tier · downloadable study notes

---

"It looks good" is not evaluation. Treat prompts like code: test them.

• Build a small eval set — representative inputs with expected outputs (or graded criteria).
• Run every prompt change against it and track a score. This turns prompt tweaking from vibes into measurement.
• For open-ended tasks, use LLM-as-judge (a second model grades answers against a rubric) or human review.

Reducing hallucination:
• Ground with retrieval; permit "I don't know".
• Lower temperature for factual tasks.
• Ask the model to cite or quote its source.
• Add verification steps for high-stakes outputs.

Without an eval set you can't tell whether a prompt edit helped or hurt — you're flying blind. The teams that ship reliable LLM features all have evals.

## Study image

Eval set → score every change → ship what measurably wins

## Checkpoint recap

1. **Why keep a fixed eval set of inputs + expected outputs?**
   - Answer: To measure whether a prompt change actually helped instead of guessing
   - Why: An eval set turns prompt iteration into measurable engineering — you can tell improvement from regression.

---

© W3Codify — free during launch. Generated study notes.
