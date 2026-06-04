# Feature: Learning progress % + "Continue learning" banner + engagement

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma + PostgreSQL (RDS); live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45` **(now t3.small, 2 GB RAM)**, key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§5 Indigo & Cyan design, §6.1 home, §6.7 profile, §6.8 classroom, §7 data) and `docs/DEPLOY.md`.
- Build with DEPLOY.md §5 command; reload only if `.next/BUILD_ID` exists; never pipe build through tail/head; **never `pkill -f next`** (kills the live app).
- Ship: build → commit+push `main` → deploy to EC2 → migrate → verify live → report.

## 1. Course progress % (everywhere an enrolled course appears)
- Compute progress from `Enrollment.progress` = **completed lessons ÷ total lessons** in the
  course (also factor in passed quiz checkpoints / assessments if available). Add a server helper
  `courseProgress(userId, courseId)` returning `{ percent, completed, total, lastLessonId }`.
- Show a **progress ring or bar + "X% complete"** on:
  - `/classroom` dashboard course cards,
  - the course player header,
  - the Profile → "Your Batches" list.
- Show "X of Y lessons" on hover/detail. 100% → a "Completed ✓" state (ties into the certificate).

## 2. "Continue learning" banner (the come-back nudge) ⭐
When a logged-in student with an **in-progress** course (0% < progress < 100%) lands on the
home page or `/classroom`, show a **dismissible banner**:

- Content: *"Continue learning **{Course}** — you're **{X}% done**"* + a **Resume** button that
  jumps to their **last-viewed lesson** (`lastLessonId`). Show a thin progress bar.
- **Cross (✕) button top-right** to dismiss. Remember dismissal (localStorage, per day) so it
  isn't naggy — re-appears next day / next session.
- ⚠️ **Don't spam one banner per course.** If the student has multiple in-progress courses, show
  **ONE** banner for the **most-recently-active** course, with a subtle *"+{N} more in progress →"*
  link to `/classroom` (or a compact horizontal row of small "continue" cards). Keep it clean.
- Only render when there's ≥1 in-progress course; never for 0 or only-completed.
- On-brand (Indigo & Cyan), accessible (the ✕ is keyboard-focusable, `aria-label`), mobile-fine.

## 3. Engagement add-ons (include these — high impact, low effort)
- **🔥 Learning streak:** a daily streak counter (consecutive days with any lesson activity),
  shown in the navbar/dashboard. Huge for retention. Store last-active date + streak on the user.
- **"Up next" on lesson complete:** after finishing a lesson, surface the next lesson with a
  one-click "Continue →" (keeps momentum; pairs with the §6.8 classroom auto-advance).
- **Resume everywhere:** clicking an in-progress course (card, banner, anywhere) opens the
  last-viewed lesson, not lesson 1.
- *(Optional, SMTP is now configured)* a **weekly progress email**: "You're {X}% through {Course} —
  pick up where you left off" with a resume link. Gate behind the user's comms consent.

## Data / notes
- `Enrollment.progress` (Json) already tracks completed lessons — read it; add fields if needed
  (e.g. `lastLessonId`, `lastActiveAt`) via a small migration. Add `streak` + `lastActiveDate`
  to `User` if you implement streaks.
- Cache progress computations where cheap; don't N+1 the lesson counts on the dashboard.

## Acceptance
- Every enrolled course shows an accurate **% complete** (dashboard, player, profile).
- A logged-in student mid-course sees the **Continue-learning banner** with a working **Resume**
  to their last lesson, a **✕** that dismisses (and remembers), and no banner spam for multiple courses.
- Streak counter increments on daily activity; "Up next" appears on lesson complete.
- Migration applied to RDS; live + healthy; typecheck/build clean. Report what changed.
