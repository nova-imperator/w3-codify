# Feature: Admin login hardening + audit log + promote-to-admin

> **Worker session.** Implement ONLY this, then ship end-to-end. The manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma + PostgreSQL (RDS); live **https://w3codify.com**; deployed on EC2 (`ubuntu@13.205.83.45`, key `C:\W3Codify\w3codify-key.pem`).
- Read `docs/BUILD_SPEC.md` (§6.9 admin, §11 auth) and `docs/DEPLOY.md`.
- Secrets in local `.env` (gitignored; `scp` to EC2). **Build on EC2 is fragile — use the exact
  command in DEPLOY.md §3/§5** (`DISABLE_WEBPACK_CACHE=1 SKIP_BUILD_CHECKS=1 NODE_OPTIONS=--max-old-space-size=1536 pnpm build`), free disk first (§3a), and only `pm2 reload` if `.next/BUILD_ID` exists. Never pipe the build through tail/head.
- Ship: build → commit+push `main` → deploy to EC2 → `prisma migrate deploy` → verify live → report.

## Current state
Admin = `User.role === "ADMIN"`. `/admin` gated by middleware + `admin/layout.tsx` + `requireAdmin()`.
**No** login restriction, **no** audit logging, and `AdminAuditLog` exists in the schema but is unused.

## Build this
1. **Promote-to-admin (bootstrap):**
   - `scripts/make-admin.ts` — promotes a user to ADMIN by email or phone (run on EC2:
     `pnpm tsx scripts/make-admin.ts <email-or-phone>`). Prints the result.
   - Admin UI: in `/admin/students`, an admin-only "Make admin / Revoke admin" action (audit-logged).
2. **IP allowlist (opt-in, must NOT lock anyone out):**
   - Env `ADMIN_IP_ALLOWLIST` = comma-separated CIDRs/IPs. **If set**, middleware blocks `/admin`
     and `/api/admin/*` from non-allowed clients (403). **If unset → no restriction** (default).
   - Behind Cloudflare → read the real client IP from `CF-Connecting-IP` (fallback `X-Forwarded-For`).
3. **Session hardening for admins:**
   - Shorter admin session (e.g. idle timeout ~30 min): if an ADMIN session is older than
     `ADMIN_SESSION_MAX_MIN` (default 60), require re-auth before `/admin` (redirect to sign-in).
4. **Audit log (wire the existing `AdminAuditLog`):**
   - Every admin mutation in `src/server/admin/actions.ts` writes an entry
     `{ actorId, action, entity, entityId, meta }`. Add `/admin/audit` — a read-only, paginated,
     filterable table of recent admin actions.
5. Keep it on-brand (Indigo & Cyan), accessible, mobile-fine.

## Acceptance
- I can promote my account to ADMIN via the script (and later via the UI).
- With `ADMIN_IP_ALLOWLIST` unset, admin works normally; with it set, non-allowed IPs get 403 on `/admin`.
- Every admin create/update/delete shows up in `/admin/audit`.
- Migration applied to RDS; live site healthy; typecheck/build clean. Report what changed.
