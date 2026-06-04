# Feature: REMOVE the Code Playground entirely (de-bloat)

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.
> Goal: strip out the code playground + Monaco editor + code runner completely. It's the
> heaviest part of the build and not core to a course platform. This should make the build
> **significantly smaller/faster** (Monaco is multi-MB).

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma; live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45` (t3.small, 2 GB), key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§6.8.2 — the playground being removed) and `docs/DEPLOY.md`.
- Build with DEPLOY.md §5 command; reload only if `.next/BUILD_ID` exists; **never `pkill -f next`** (kills the live app — match only the build).
- Ship: build → commit+push `main` → deploy to EC2 → migrate → verify live → report.

## Remove ALL of this
1. **Standalone playground:** delete `/playground` page/route and its components, and remove the
   **navbar link** to it (and any feature-flag gating for it).
2. **Monaco editor:** remove the editor component(s) and **uninstall** the dependency
   (`@monaco-editor/react` / `monaco-editor`) from `package.json`. This is the big win.
3. **Code runner:** delete `src/server/runner/`, the **`POST /api/run`** route, and all provider
   code (Wandbox/Judge0/Piston). Remove `RUNNER_PROVIDER` (and any JUDGE0/PISTON vars) from
   `.env`, `.env.example`, and BUILD_SPEC.
4. **In-lesson runnable exercises:** remove the `CODE_EXERCISE` block type and its
   editor/run/grade UI. **Convert any existing `CODE_EXERCISE` lesson blocks to plain read-only
   `CODE` blocks** (show the starter code as a static, syntax-highlighted snippet) so lessons
   still render and nothing 404s/crashes. Update `prisma/content.ts` (the seeded courses) the
   same way — replace exercises with a normal code block (or drop them).
5. **Data:** remove the `CodeSubmission` model + its relations, and the `CODE_EXERCISE` value
   from the `BlockType` enum. Add a Prisma migration that drops the `CodeSubmission` table and
   the enum value (write it safely; the table is fine to drop — it's only playground data).
6. **Lesson completion:** wherever "lesson complete requires passing the exercise" exists,
   change it so a lesson completes on **video watched + quiz checkpoints passed** only.
7. **Feature flag:** remove the `code_playground` flag (from `src/server/flags.ts` FLAG_DEFS,
   the seed, and the admin Settings UI).
8. **Docs:** in `docs/BUILD_SPEC.md`, delete/mark §6.8.2 as removed so it's never rebuilt.

## Don't break
- Lessons must still render (text, video, images, code snippets, quizzes, callouts, docs).
- The 5 courses still load; `/courses`, `/classroom`, the course player all work.
- Keep the lightweight syntax-highlighting for **read-only** code blocks (that's fine — it's the
  heavy *editable/runnable* Monaco path we're removing).

## Acceptance
- `/playground` is gone (404 or removed from nav); `monaco`/runner deps are out of `package.json`.
- No `/api/run`; no `CODE_EXERCISE` blocks render an editor anywhere.
- Existing lessons show their old exercises as **static code snippets**, not broken.
- Migration applied (CodeSubmission dropped); 5 courses + lessons + quizzes all still work.
- **Report the before/after build output size / time** so we can see how much lighter it got.
- Live + healthy; typecheck/build clean.
