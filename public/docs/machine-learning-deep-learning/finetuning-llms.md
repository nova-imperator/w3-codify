# Fine-tuning LLMs (LoRA / QLoRA)

**Machine Learning & Deep Learning** · GOD tier · downloadable study notes

---

An LLM is pretrained on web-scale text to predict the next token, then instruction-tuned to follow prompts, and optionally aligned with RLHF or DPO to match human preferences.

You rarely full-fine-tune a large model — it's too expensive. Instead use parameter-efficient fine-tuning:
• LoRA freezes the base weights and learns tiny low-rank update matrices, training <1% of parameters.
• QLoRA quantises the frozen base to 4-bit so a 13B model fits on a single consumer GPU.

At inference, control generation with decoding parameters: temperature (randomness), top-p / top-k (nucleus sampling), and respect the model's context window.

## Code

```python
from peft import LoraConfig, get_peft_model

cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                 target_modules=["q_proj", "v_proj"])
model = get_peft_model(base_model, cfg)
model.print_trainable_parameters()  # ~0.2% of params
```

> Fine-tune to change behaviour/format/style; use RAG (next lesson) to add knowledge. Mixing these up is the most common LLM design mistake.

## Study image

Train tiny adapters; keep the base model frozen

## Checkpoint recap

1. **You need the model to know your company's latest internal docs. Best approach?**
   - Answer: Use RAG to retrieve the docs at query time
   - Why: Knowledge that changes should be retrieved (RAG), not baked in by fine-tuning, which is for behaviour/format.

2. **Lower temperature during decoding makes output…**
   - Answer: More deterministic/focused
   - Why: Temperature scales the logits; lower values sharpen the distribution toward the most likely tokens.

---

© W3Codify — free during launch. Generated study notes.
