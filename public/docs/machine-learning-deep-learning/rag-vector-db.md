# Retrieval-Augmented Generation (RAG)

**Machine Learning & Deep Learning** · GOD tier · downloadable study notes

---

RAG grounds an LLM in your own data so it answers from facts instead of hallucinating.

Pipeline:
1. Chunk documents into passages.
2. Embed each chunk into a vector and store it (pgvector, Pinecone, FAISS).
3. At query time, embed the question, retrieve the most similar chunks.
4. Optionally re-rank for precision.
5. Stuff the retrieved context into the prompt and generate a grounded, cited answer.

Evaluation matters: measure retrieval recall and answer faithfulness, not vibes. Reducing hallucination comes from better chunking, retrieval, and instructing the model to say "I don't know" when context is missing.

## Code

```python
q = embed(question)
hits = vector_db.search(q, top_k=5)           # nearest chunks
context = "\n\n".join(h.text for h in hits)
answer = llm(f"Answer using ONLY this context:\n{context}\n\nQ: {question}")
```

## Study image

Embed → retrieve → re-rank → generate with citations

## Checkpoint recap

1. **The single biggest lever for reducing hallucination in RAG is…**
   - Answer: Good retrieval — feeding the model the right context
   - Why: If the right passage isn't retrieved, no model can answer faithfully. Retrieval quality dominates RAG performance.

---

© W3Codify — free during launch. Generated study notes.
