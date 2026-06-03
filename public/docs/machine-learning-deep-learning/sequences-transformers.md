# Sequence models → Transformers

**Machine Learning & Deep Learning** · Advanced tier · downloadable study notes

---

RNNs and LSTMs process tokens one at a time, carrying a hidden state. They struggle with long-range dependencies and can't parallelise across time.

Transformers replaced them by using self-attention: every token directly attends to every other token in one parallel operation. Attention computes, for each query, a weighted sum of values based on query–key similarity:

Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V

• Multi-head attention runs several attention maps in parallel to capture different relationships.
• Positional encodings re-inject word order (attention is otherwise permutation-invariant).
• Encoder–decoder (translation) vs decoder-only (GPT-style generation).

Transformers scale: more data + more parameters keeps improving them, which is the entire basis of modern LLMs.

## Study image

Each token attends to every other token in parallel

## Checkpoint recap

1. **Why divide QKᵀ by √dₖ in scaled dot-product attention?**
   - Answer: To keep the dot products from growing large and saturating softmax
   - Why: Large dot products push softmax into tiny-gradient regions; scaling by √dₖ keeps the variance controlled.

2. **Why do Transformers need positional encodings?**
   - Answer: Self-attention has no inherent notion of token order
   - Why: Attention treats inputs as a set; positional encodings inject the sequence order the model would otherwise ignore.

---

© W3Codify — free during launch. Generated study notes.
