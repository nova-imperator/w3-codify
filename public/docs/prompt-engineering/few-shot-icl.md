# Few-shot & in-context learning

**Prompt Engineering** · Advanced tier · downloadable study notes

---

LLMs learn the pattern of a task from examples in the prompt — no training required. This is in-context learning.

• Zero-shot: just the instruction. Fine for simple, common tasks.
• Few-shot: include 1–5 worked examples (input → output). The model imitates the format and style precisely.

Few-shot is the fastest way to (a) pin down an exact output format, (b) teach an edge-case rule, and (c) raise accuracy on niche tasks. Choose examples that are representative and diverse, and make them look exactly like what you want back — the model copies whitespace, casing, and structure.

Watch the cost: examples eat context tokens, so use the fewest that lock in the behaviour. If you need dozens of examples, that's a signal to fine-tune or use retrieval instead.

> Few-shot tip: make your examples identical in shape to the desired answer. The model is a mimic — if your examples are clean JSON, you'll get clean JSON.

## Study image

Examples in the prompt teach the task with no training

## Checkpoint recap

1. **What is in-context learning?**
   - Answer: The model learning a task's pattern from examples placed in the prompt
   - Why: In-context learning means the model infers the task from in-prompt examples without any weight updates.

2. **You need dozens of examples to get good results. The better move is…**
   - Answer: Fine-tune or use retrieval
   - Why: Dozens of examples blow the token budget; that's the signal to fine-tune or retrieve relevant examples dynamically.

---

© W3Codify — free during launch. Generated study notes.
