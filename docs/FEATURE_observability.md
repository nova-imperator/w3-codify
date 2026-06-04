# Feature: Activate & complete observability (Sentry + PostHog analytics)

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15; live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45`, key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§13) and `docs/DEPLOY.md`.
- **EC2 build is fragile — use DEPLOY.md §3/§5 exact build command**, free disk first (§3a), reload only if `.next/BUILD_ID` exists, never pipe build through tail/head.
- Ship: build → commit+push `main` → deploy to EC2 → verify live → report.

## Current state (already partly wired — finish + activate)
- **Sentry** (`@sentry/nextjs`): `src/instrumentation.ts` inits **only if `SENTRY_DSN` set**;
  `src/app/global-error.tsx` exists. Sentry is currently **dormant** (no DSN).
- **PostHog** (`posthog-js`): `src/lib/analytics.ts` + `src/components/providers/observability.tsx`
  init **only if `NEXT_PUBLIC_POSTHOG_KEY` set**. Currently **dormant** (no key).
- Note: Sentry = error/crash tracking; PostHog = product analytics — separate concerns, both wanted.

## Build this
1. **Sentry — complete the wiring** so it's production-grade when `SENTRY_DSN` is set:
   - Ensure **client + server + edge** are all covered (Next 15 instrumentation: server in
     `instrumentation.ts`, client via `instrumentation-client.ts`/`sentry.client.config`). Keep the
     `SENTRY_DSN`-gated init (no DSN → fully no-op).
   - Sensible `tracesSampleRate` (e.g. 0.1), `environment` from `NODE_ENV`, filter noise/PII.
   - Source-map upload is **optional** (needs `SENTRY_AUTH_TOKEN`) — gate it so builds don't fail without it.
   - Add a temporary `/api/debug/sentry-test` (admin-only, removed before final) to confirm capture.
2. **PostHog — complete funnel instrumentation** (gated on `NEXT_PUBLIC_POSTHOG_KEY`):
   - Pageview on route change (already partial — verify it fires).
   - `track()` on key funnel events: CTA clicks, **sign-in started/completed**, **enroll**,
     **callback submitted**, **run code**, **ask AI tutor/chatbot**. Use stable event names.
   - No PII beyond what's necessary; respect the no-key no-op.
3. **Document activation** in `docs/GO_LIVE.md`: exactly which env vars turn each on
   (`SENTRY_DSN`, optional `SENTRY_AUTH_TOKEN`; `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`),
   and that both stay dormant/no-op without them.

## Acceptance
- With no keys set: zero behaviour change, no console errors (both no-op). Build clean.
- With `SENTRY_DSN` set: a thrown test error appears in Sentry.
- With `NEXT_PUBLIC_POSTHOG_KEY` set: pageviews + the funnel events appear in PostHog.
- Live healthy; typecheck/build clean. Report what changed + the exact env vars to set.
