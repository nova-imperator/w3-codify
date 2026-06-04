# Feature: Gender-based default profile avatar

> **You are a worker session.** The manager (separate session) keeps the source-of-truth
> specs in `docs/`. This file is a complete, self-contained task — implement ONLY this,
> then ship it end-to-end.

---

## Project context (read first)
- Repo: `nova-imperator/w3-codify` (GitHub). App: Next.js 15 + Prisma + PostgreSQL (RDS),
  deployed on EC2. Live: **https://w3codify.com**.
- Read `docs/BUILD_SPEC.md` (conventions, §5 design system, §6.7 Profile, §7 data model)
  and `docs/DEPLOY.md` before coding.
- **Secrets:** real values are in the local `.env` (gitignored — never commit it). SSH key
  is `C:\W3Codify\w3codify-key.pem`. EC2 = `ubuntu@13.205.83.45`.
- **Ship end-to-end (every change goes all the way to live):**
  1. Build + verify locally.
  2. Commit + push to GitHub `main`.
  3. Deploy to EC2: SSH in, `cd ~/w3-codify`, `git pull`, `pnpm install`,
     `pnpm prisma migrate deploy`, build, `pm2 reload ecosystem.config.js --update-env`.
  4. Apply the migration to RDS (the `migrate deploy` above; `.env` already on the box).
  5. Confirm on the live site and report.

---

## What to build
Show a **gender-based default avatar** in the top-right profile menu (and everywhere an
avatar renders) when the user hasn't uploaded a custom one.

### Assets (already in repo)
- `public/images/gender/male.avif`
- `public/images/gender/female.avif`

### 1. Data model
- Add to `User`: `gender Gender @default(UNSPECIFIED)` with
  `enum Gender { MALE FEMALE UNSPECIFIED }`. Create + apply a Prisma migration to RDS.
- Expose `gender` on the session user (Auth.js session/jwt callback) and in
  `getCurrentUser()` so the navbar avatar can resolve without an extra query.

### 2. Avatar resolution (single source of truth)
Add a shared helper, e.g. `resolveAvatarUrl(user)` in `src/lib/` (and/or a small `<Avatar>`
wrapper). Resolution order:
1. `user.avatarUrl` (custom upload) → use it.
2. else `gender === "MALE"` → `/images/gender/male.avif`.
3. else `gender === "FEMALE"` → `/images/gender/female.avif`.
4. else (UNSPECIFIED / no avatar) → keep the existing neutral fallback (initials/default).

Use this helper **everywhere an avatar renders** — the top-right user menu
(`src/components/marketing/user-menu.tsx`), the Profile sidebar (§6.7), admin user lists,
and anywhere else — so they all behave consistently. Serve via `next/image` (AVIF is fine).

### 3. Where the user sets gender
- **First-login onboarding** (the skippable Name + Contact step, BUILD_SPEC §6.4): add an
  optional **Gender** choice (Male / Female / Prefer not to say). Skippable — never block entry.
- **Profile → Basic Info** (§6.7): add a Gender selector so it's editable later.
- On change, the avatar updates immediately (optimistic).

### 4. Polish
- On-brand (Indigo & Cyan), accessible labels, mobile-perfect.
- If `gender` is UNSPECIFIED, the current neutral default must still look fine (no broken image).

---

## Acceptance criteria
- A user with `gender=MALE` and no upload shows `male.avif` in the top-right menu + profile;
  `FEMALE` shows `female.avif`; a custom upload still overrides both.
- Gender is settable in onboarding (skippable) and editable in Profile, and persists to RDS.
- One shared resolver used by all avatar render sites (no duplicated logic).
- Migration applied to RDS; live site updated; typecheck/build clean.

## Done = shipped
Run locally → show it working → commit + push → deploy to EC2 → migrate RDS → confirm on
https://w3codify.com → report what changed. Use the local `.env` and `w3codify-key.pem`.
