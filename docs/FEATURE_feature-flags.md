# Feature: Feature-flag system (admin-toggleable)

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma + PostgreSQL (RDS); live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45`, key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§6.9 admin) and `docs/DEPLOY.md`.
- **EC2 build is fragile — use DEPLOY.md §3/§5 exact build command**, free disk first (§3a), reload only if `.next/BUILD_ID` exists, never pipe build through tail/head.
- Ship: build → commit+push `main` → deploy to EC2 → `prisma migrate deploy` → verify live → report.

## Current state
No feature-flag system exists (the spec mentions it; never built).

## Build this
1. **Data + service**
   - `FeatureFlag` model: `{ key String @id, enabled Boolean, description String?, updatedAt }` + migration.
   - `src/server/flags.ts`: `isFeatureEnabled(key)` reading the DB with a **short in-process cache**
     (e.g. 30 s TTL) so it's not a per-request query. Sensible **default** per key if the row is missing.
   - Seed the initial flags (idempotent upsert) — see list below.
2. **Admin UI** — `/admin/settings` → **Feature Flags** section: list every flag with a toggle,
   description, and last-updated. Toggling writes to the DB and is **audit-logged**. On-brand, accessible.
3. **Wire these flags to real behaviour** (at minimum):
   | key | default | gates |
   |---|---|---|
   | `maintenance_mode` | off | when on, show a friendly maintenance page for non-admins |
   | `new_signups` | on | when off, block new account creation at sign-in |
   | `paid_pricing` | off | when on, show real prices/checkout; off = everything FREE (current) |
   | `ai_tutor` | on | show/hide the in-lesson AI tutor |
   | `chatbot` | on | show/hide the floating site chatbot |
   | `code_playground` | on | show/hide `/playground` + in-lesson exercises |
   | `course_reviews` | off | reserve for a future reviews feature |
   - Flags must be read **server-side** where they gate access; client components get their values via a
     small server-provided context (no secrets, just booleans).

## Acceptance
- Admin can toggle each flag and the effect is immediate (within the cache TTL).
- `maintenance_mode` on → public users see the maintenance page, admins still get in.
- `new_signups` off → new accounts can't be created; existing users still sign in.
- Migration applied to RDS; live healthy; typecheck/build clean. Report what changed.
