# Automatic prompt optimization

**Prompt Engineering** · GOD tier · downloadable study notes

---

Hand-tuning prompts doesn't scale. Modern practice optimises prompts programmatically.

• APE / meta-prompting — use an LLM to generate and refine candidate prompts, then keep the best by your eval score.
• DSPy — declare the task as modules with input/output signatures; a compiler searches for the prompts (and few-shot examples) that maximise a metric on your data. You optimise a metric, not wordsmith by hand.
• Bootstrapped few-shot — automatically select the most helpful examples from a pool rather than hand-picking.

The mindset shift: a prompt is a parameter you optimise against a metric, just like model weights. Define the metric, build the eval set, and let search find prompts a human wouldn't.

## Study image

Generate candidates → score on evals → keep the winners

## Checkpoint recap

1. **Tools like DSPy treat a prompt as…**
   - Answer: A parameter to optimise against a metric on your data
   - Why: Programmatic optimizers search prompt/example space to maximise an eval metric — prompts become tuned parameters.

---

© W3Codify — free during launch. Generated study notes.
