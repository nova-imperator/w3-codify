# Feature: Auth UX — OTP paste-fills-all + 24-hour sessions

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Auth.js v5; live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45` (t3.small, 2 GB), key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§11 auth) and `docs/DEPLOY.md`.
- Build with DEPLOY.md §5 command; reload only if `.next/BUILD_ID` exists; **never `pkill -f next`** (it kills the live app — match only the build).
- Ship: build → commit+push `main` → deploy to EC2 → verify live → report.

## 1. OTP input: paste fills ALL boxes
Right now, when a user copies the 6-digit code from their email and pastes it into the OTP
input, only the **first box** gets filled and they must type the other 5 by hand. Fix the OTP
component so a **paste distributes all digits across the boxes** automatically.

- On `paste` (anywhere in the OTP field), read the clipboard text, strip non-digits, take the
  first N digits (N = number of boxes, 6), and **fill every box**, then move focus to the last
  box (or auto-submit if complete).
- Also handle: pasting into the middle box, pasting fewer/more digits gracefully, and mobile
  paste. Keep single-key typing + backspace + arrow-key navigation working as before.
- If the code is complete after paste, **auto-verify** (same as typing the last digit).
- This is the `OtpInput` component (search `src/components/auth/` — e.g. `otp-input.tsx`).
  Coordinate with the email-OTP flow; don't break the existing sign-in.

## 2. Sessions expire after 24 hours (security)
Make every user's login session last **exactly 24 hours**, then they're logged out and must
sign in again.

- In the Auth.js config (`src/lib/auth.config.ts`), set the session **maxAge to 24 hours**:
  `session: { strategy: "jwt", maxAge: 60 * 60 * 24 }` (86400 s). Also set the JWT `maxAge` to
  match so the token itself expires at 24 h.
- After 24 h the session is invalid → the user is redirected to sign-in on the next protected
  request. (This is separate from, and coexists with, the existing admin-only
  `ADMIN_SESSION_MAX_MIN` re-auth — keep that as-is.)
- Don't shorten it with a sliding window that never expires; the hard cap is 24 h from login.

## Acceptance
- Pasting a 6-digit code (from email/clipboard) **fills all 6 boxes** and auto-verifies; typing
  still works normally.
- A session older than 24 h is rejected → user must sign in again (verify by setting maxAge and
  confirming the JWT `exp` is ~24 h out).
- Live + healthy; typecheck/build clean. Report what changed.
