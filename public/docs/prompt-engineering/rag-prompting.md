# Retrieval-augmented prompting

**Prompt Engineering** · Advanced tier · downloadable study notes

---

Models hallucinate when asked about facts not in their training data. Retrieval-augmented generation (RAG) fixes this by putting the facts into the prompt.

The flow: embed your knowledge base → at query time, retrieve the most relevant chunks → insert them into the prompt as context → instruct the model to answer using only that context and to cite sources.

Prompting matters as much as retrieval here:
• Clearly mark the retrieved context and say "Answer using ONLY the context above."
• Tell the model to respond "I don't know" if the answer isn't in the context — this is the single biggest hallucination reducer.
• Ask for citations so answers are auditable.

RAG keeps answers current and grounded without retraining, which is why it powers most real-world LLM apps.

> The biggest grounding win isn't a bigger model — it's instructing the model to answer only from the provided context and to say 'I don't know' otherwise.

## Study image

Retrieve relevant context → answer only from it → cite

## Checkpoint recap

1. **In RAG, the instruction that most reduces hallucination is…**
   - Answer: Answer using ONLY the provided context; say 'I don't know' otherwise
   - Why: Grounding the model to the retrieved context and permitting 'I don't know' stops confident fabrication.

---

© W3Codify — free during launch. Generated study notes.
