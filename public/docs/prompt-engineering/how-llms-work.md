# How LLMs actually work

**Prompt Engineering** · Basics tier · downloadable study notes

---

An LLM is a next-token predictor. To prompt it well you must picture what it sees.

Tokens. Text is split into tokens (~4 characters of English each). The model reads and writes tokens, not words — which is why it sometimes miscounts letters and why long inputs cost more.

Context window. Everything the model can "see" — your system prompt, the conversation, retrieved documents — must fit in a fixed token budget. Once it's full, older content is dropped or must be summarised. Treat context as scarce, valuable real estate.

Sampling. The model outputs a probability distribution over the next token; temperature and top-p control how it picks. Low temperature → focused, deterministic, repeatable (use for extraction, code, classification). High temperature → diverse, creative (use for brainstorming). For anything you need to parse, turn temperature down.

The whole craft of prompting is shaping that distribution with the right context so the most-likely next tokens are the ones you want.

> Rule of thumb: low temperature for anything you'll parse (JSON, code, labels); higher only when you genuinely want variety.

## Study image

Tokenise → fill the context → sample the next token

## Checkpoint recap

1. **You need the model to return the same answer every time for parsing. Set…**
   - Answer: Low temperature (near 0)
   - Why: Low temperature sharpens the distribution toward the most-likely tokens, making output focused and repeatable.

2. **Why do very long prompts cost more and sometimes lose detail?**
   - Answer: Pricing + the context window are measured in tokens, which are finite
   - Why: Cost and the context window are token-based; a full window forces older content to be dropped or summarised.

---

© W3Codify — free during launch. Generated study notes.
