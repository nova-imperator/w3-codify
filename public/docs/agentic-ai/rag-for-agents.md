# RAG for agents: retrieval & grounding

**Agentic AI & AI Agents** · Advanced tier · downloadable study notes

---

Agents need knowledge they weren't trained on — your docs, a wiki, the web. Retrieval gives it to them as a tool.

• Embed your knowledge base into a vector database (pgvector, Pinecone, FAISS): each chunk becomes a vector.
• Expose a search tool: embed the query, return the top-k most similar chunks.
• The agent calls search when it needs facts, then grounds its answer in the retrieved text and cites it.

For agents specifically:
• Retrieval is just another tool the agent decides to use — often multiple times, refining the query.
• Chunking and re-ranking quality dominate answer quality.
• Always instruct grounding: answer from retrieved context; say "I don't know" if it's missing.

RAG is what lets an agent answer about *your* world accurately and stay current without retraining.

## Study image

Embed → vector DB → search tool → grounded, cited answers

## Checkpoint recap

1. **For an agent, retrieval (RAG) is best thought of as…**
   - Answer: Another tool the agent calls to fetch relevant context
   - Why: Retrieval is a tool the agent invokes (often repeatedly) to ground answers in your knowledge base.

---

© W3Codify — free during launch. Generated study notes.
