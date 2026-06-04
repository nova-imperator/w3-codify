# Chain-of-thought & reasoning

**Prompt Engineering** · Advanced tier · downloadable study notes

---

For multi-step problems (math, logic, planning), asking the model to reason step by step before answering dramatically improves accuracy. This is chain-of-thought (CoT) prompting.

• Add "Let's think step by step" or "Show your reasoning, then give the final answer."
• The model uses its own generated steps as scratchpad context, which keeps it from blurting a wrong answer.

Trade-offs: CoT costs more tokens and latency, and you usually don't want the reasoning shown to end users. Common patterns:
• Ask for reasoning, then a clearly delimited final answer you can extract.
• For production, hide or discard the reasoning and keep only the answer.

Newer "reasoning models" do this internally — but explicit CoT still helps on hard tasks and on smaller/cheaper models. Don't use CoT for trivial tasks; it just burns tokens.

## Study image

Reason step by step, then commit to a final answer

## Checkpoint recap

1. **Chain-of-thought prompting most improves…**
   - Answer: Multi-step reasoning tasks (math, logic, planning)
   - Why: Explicit step-by-step reasoning helps on multi-step problems; it just wastes tokens on trivial tasks.

---

© W3Codify — free during launch. Generated study notes.
