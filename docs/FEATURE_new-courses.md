# Feature: Add 2 trending courses — Prompt Engineering + Agentic AI

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma + PostgreSQL (RDS); live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45`, key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§6.8.1 multi-format lessons, §7 data model, §7.1 course model) and `docs/DEPLOY.md`.
- ⚠️ **EC2 build is RAM-tight (~908 MB).** Use the EXACT build command in DEPLOY.md §5
  (`DISABLE_WEBPACK_CACHE=1 SKIP_BUILD_CHECKS=1 NODE_OPTIONS=--max-old-space-size=1536 pnpm build`),
  reload only if `.next/BUILD_ID` exists, never pipe the build through tail/head.
- Ship: build → commit+push `main` → deploy to EC2 → seed/migrate → verify live → report.

## ⚠️ Critical: do NOT clobber the existing 3 courses
The current `prisma/seed.ts` **rebuilds every course's sections** (delete + recreate), which
would assign NEW lesson IDs and break any existing enrollment progress / code submissions.
**Seed ONLY the 2 new courses** — e.g. add a `SEED_ONLY=<slugs>` guard, or a small
`scripts/seed-courses.ts` that upserts just the new slugs and rebuilds sections **only** for
them. Leave `machine-learning-deep-learning`, `cloud-computing`, `cyber-security` untouched.

## Build this
Add two full **multi-format** courses (same shape as the existing ones in `prisma/content.ts`):
each lesson = text + a code block + study image + (where useful) a runnable `CODE_EXERCISE` +
a downloadable doc + ≥1 quiz checkpoint; plus tier + final assessments. **FREE** (`priceInr=0`,
`isLive=true`, `level=ADVANCED`). Add instructors (reuse or new). Image paths follow the
existing convention `/images/lessons/<slug>/<lesson>.png` (placeholders OK — the Whisk pack
generates them later).

### Course A — Prompt Engineering (`slug: prompt-engineering`)
**Outcome:** write production-grade prompts and ship reliable LLM features.
- **Basics:** how LLMs work (tokens, context, temperature/sampling); anatomy of a good prompt
  (role, instructions, context, examples, output format).
- **Advanced:** few-shot / in-context learning; chain-of-thought & reasoning; structured output
  (JSON, schemas, function calling); prompt patterns (personas, delimiters, decomposition);
  retrieval-augmented prompting; evaluating/testing prompts & reducing hallucination.
- **GOD:** automatic prompt optimization; guardrails + prompt-injection defense; cost/latency
  optimization, caching, model selection; productionizing (versioning, A/B, observability).
- **Capstone:** build a reliable LLM feature (e.g., a schema-validated extractor or graded tutor).

### Course B — Agentic AI & AI Agents (`slug: agentic-ai`)
**Outcome:** build autonomous AI agents that use tools, retrieve knowledge, and act.
- **Basics:** LLM APIs + tool/function calling; what an agent is (perceive→reason→act, ReAct).
- **Advanced:** tool use in depth; RAG for agents (vector DBs, retrieval, grounding); memory
  (short/long-term, state); planning & multi-step reasoning; agent frameworks (LangGraph /
  OpenAI Agents SDK); evaluation & observability for agents.
- **GOD:** multi-agent systems (orchestration, roles); guardrails, safety, human-in-the-loop;
  cost/latency, caching, production deployment; ship a real agent.
- **Capstone:** a working multi-tool agent (e.g., a research or coding agent with RAG).

## Acceptance
- `/courses` shows **5** courses; `/courses/prompt-engineering` and `/courses/agentic-ai`
  render full curricula, study images, quizzes, and (≥1 each) a runnable code exercise.
- The original 3 courses are **unchanged** (curriculum + IDs intact).
- Both new courses are FREE with the launch badges; sitemap includes them.
- Live + healthy; typecheck/build clean. Report what changed.
