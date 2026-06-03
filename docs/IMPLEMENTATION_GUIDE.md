# W3Codify — Implementation Guide (how to build it with Claude Code)

> Build the platform **one milestone at a time**. `BUILD_SPEC.md` is the full source of
> truth; this guide is the *execution plan* — what to do each session, the exact prompt to
> paste, and how to know a chunk is done. **Do not try to build everything in one shot.**

---

## Golden rules
1. **Spec stays in the repo.** Don't paste `BUILD_SPEC.md` into chat — tell Claude Code to
   read it. It re-reads for full context every session.
2. **One milestone per session.** Scope creep kills big builds.
3. **Verify before advancing.** Run it, click it, see it work — *then* commit and continue.
4. **Every stage ships end-to-end.** After building each milestone: commit + push to GitHub,
   deploy to EC2 (DEPLOY.md), and apply RDS migrations. Don't leave deploy for the end.
5. **Never commit `.env`.** It's gitignored. Secrets stay local (and `scp`'d to EC2 — see `DEPLOY.md`).
6. **Match the bar.** Everything ships to the §5.6 "God-Level Frontend Standard".

---

## Kickoff prompt (paste at the start of each session — change the session number)
Each stage goes all the way to live: **build → GitHub → EC2 → RDS.**
```
Read docs/BUILD_SPEC.md, docs/IMPLEMENTATION_GUIDE.md, and docs/DEPLOY.md.

Build ONLY <SESSION N — milestone name>. Do not start later milestones.
Follow the tech stack (§3) and the God-Level Frontend Standard (§5.6).

Then, before finishing THIS stage, do all of these in order:
1. Run it locally and show me it works.
2. Commit and push to GitHub (main).
3. Deploy to EC2 by following DEPLOY.md — first time, do the one-time EC2
   setup, scp the .env, and set up Nginx + PM2. After that: pull + rebuild + restart.
4. Apply database changes to RDS with Prisma migrations — first time, create the
   w3codify database and open the RDS security group (DEPLOY.md §0).
5. Confirm the live EC2 site is updated and give me the URL/IP.
6. Tick the progress checklist in IMPLEMENTATION_GUIDE.md.

Use the credentials in the local .env and the SSH key w3codify-key.pem.
```

> Session 1 is frontend-only, so there's nothing to migrate on RDS yet (DB work starts
> Session 2). That's expected — just create the DB and continue.

---

## Session-by-session plan (maps to BUILD_SPEC §16)

### Session 1 — Foundation + Home page  *(spec steps 1–3)*
Scaffold Next.js 15 + TS + Tailwind v4 + shadcn + fonts + `tokens.css` + Lenis. Base
layout, Navbar, Footer, core UI primitives. Then build the **full Home page** (§6.1, all 14
sections) to the god-level bar, responsive, Lighthouse ≥ 95. Add a `/dev/ui` component gallery.
**Done when:** homepage looks stunning at 360/768/1440px, animates smoothly, passes Lighthouse.

### Session 2 — Data layer + Catalog  *(steps 4–5)*
Prisma schema (§7), connect to RDS, migrate, seed the 3 courses (§7.1). Build **Courses**
list (filter/search) + **Single course** page (sticky enroll, JSON-LD).
**Done when:** catalog renders from the DB; a course detail page works end-to-end.

### Session 3 — Auth + Admin panel  *(steps 6–7)*
Auth.js: Phone-OTP + Google, Sign In, Sign Up (+reCAPTCHA), role-protected middleware.
Then the **Admin panel** (§6.9): course CRUD + curriculum builder + rich lesson-block editor
+ media library + leads + students.
**Done when:** you can sign in as admin and create a course with image-rich lessons — no code.

### Session 4 — Leads + Profile + Payments  *(steps 8–10)*
Request-Callback modal + API + leads. Profile (all sections, avatar → S3). Enrollment +
Razorpay checkout for paid cohorts.
**Done when:** a student can register, edit profile, and enroll (free + paid).

### Session 5 — Classroom + AI Tutor  *(steps 11–12)*
Classroom dashboard + course player rendering lesson blocks (incl. study images). The
**AI Tutor** (§8): streaming chat, explain/fix code, project review, home-page teaser.
**Done when:** an enrolled student can watch lessons and chat with the AI tutor in-context.

### Session 6 — Polish + Deploy  *(steps 13–14)*
SEO, analytics, Sentry, a11y audit, perf budget, tests. Then deploy per `DEPLOY.md`
(Nginx + PM2 + Certbot on EC2, GitHub Actions CI/CD).
**Done when:** it's live on the domain over HTTPS and a push auto-deploys.

> Sessions can be split further if context fills — e.g. do Navbar/Footer/primitives, *then*
> the Home page, in two passes. Smaller is always safer than bigger.

---

## Progress checklist (Claude ticks these as it goes)
- [x] **S1** Scaffold + design system + `/dev/ui`
- [x] **S1** Home page — all sections, responsive, Lighthouse ≥ 95
- [x] **S2** Prisma schema + RDS connected + migrated
- [x] **S2** 3 courses seeded
- [x] **S2** Courses list + Single course page
- [x] **S3** Auth — Phone-OTP + Google + protected routes
- [x] **S3** Admin — course CRUD + curriculum builder
- [x] **S3** Admin — rich lesson-block editor + media library
- [x] **S3** Admin — leads + students
- [x] **S4** Request Callback (modal + leads)
- [x] **S4** Profile — all sections + avatar to S3
- [x] **S4** Enrollment + Razorpay
- [x] **S5** Classroom dashboard + course player
- [x] **S5** AI Tutor — chat + explain/fix + project review + home teaser
- [x] **S6** SEO + analytics + Sentry + tests + a11y/perf pass
- [x] **S6** Deployed to EC2 + CI/CD _(HTTPS pending: domain is on Cloudflare, not pointed at the EC2 IP — one-command Certbot ready in DEPLOY §4)_

---

## Practical tips
- Package manager: **pnpm**. Node 22.
- Run `prisma migrate dev` locally; `prisma migrate deploy` on EC2.
- The implementing session **reads real secrets from local `.env`** — no need to pass them.
- Generate images with the realism pack (`WHISK_IMAGE_PROMPTS.md`) and drop them into the
  `public/images/...` paths named there — components will pick them up.
- Keep PRs/commits scoped to the milestone; push after each so EC2 stays in sync.
