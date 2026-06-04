# Feature: Classroom UX overhaul — slidable panels, less clutter

> **Worker session.** Implement ONLY this, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context (read first)
- Repo `nova-imperator/w3-codify`; Next.js 15; live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45`, key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§5 design system — Indigo & Cyan, §5.6 god-level bar, §6.8 classroom) and `docs/DEPLOY.md`.
- ⚠️ **EC2 build is RAM-tight (~908 MB).** Use the EXACT build command in DEPLOY.md §5; reload only if `.next/BUILD_ID` exists; never pipe the build through tail/head.
- Ship: build → commit+push `main` → deploy to EC2 → verify live → report.

## Problem
The course player shows **everything at once** (lesson list + content + AI tutor all docked).
It feels cluttered, and the lesson/curriculum panel **doesn't scroll with a laptop trackpad**
(only with a mouse wheel). Declutter it and make the side panels slide.

## Build this

### 1. AI Tutor → slide-in drawer, CLOSED by default
- Convert the docked tutor into a **right-side slide-in drawer**, **closed by default**.
- A floating toggle button (sparkle/"Ask AI Tutor", bottom-right) opens/closes it with a smooth
  spring slide. Keyboard shortcut to toggle (e.g. `T`). **Persist** open/closed in localStorage.
- Mobile: render as a **bottom-sheet**.
- Don't lose context — the tutor still sees the current lesson when opened.

### 2. Lesson / curriculum sidebar → slidable, OPEN by default + FIX SCROLL
- Keep the lesson list **open by default**, but make it **collapsible** (a toggle to hide it for
  focus; remembers state).
- 🔴 **FIX the trackpad scroll bug.** The panel must be a proper **native scroll container**:
  a constrained height (e.g. `h-[calc(100dvh-…)]`), `overflow-y: auto`, `overscroll-behavior: contain`,
  and it must scroll with **trackpad, mouse wheel, AND touch**. (Likely the container height isn't
  constrained, an ancestor is `overflow-hidden`, or a custom wheel handler ignores trackpad/touch.)
  Verify on a real trackpad and on mobile.

### 3. Main content
Stays centered and scrollable; widens when either side panel is collapsed.

### 4. Suggested improvements (include these — they make it feel premium)
- **Course progress bar** at the top (% complete) + per-lesson done checks.
- **"Mark complete & Next"** button that auto-advances to the next lesson.
- **Focus mode** toggle (`F`) that hides BOTH side panels for distraction-free study.
- **Resume**: opening a course jumps to the last-viewed lesson.
- **Keyboard shortcuts**: `←/→` (or `J`/`K`) prev/next lesson, `T` toggle tutor, `F` focus mode.
- **Persist layout** (panels open/closed, last lesson) in localStorage so it remembers per user.
- Smooth slide/spring animations (Framer Motion), but **respect `prefers-reduced-motion`**.
- *(Optional)* drag-to-resize the side panels.

### 5. Quality bar
On-brand Indigo & Cyan, fully accessible (focus trap + ARIA for the drawer, Esc to close,
focus-visible), and **flawless on mobile** (360px) — the two panels become bottom-sheets there.

## Acceptance
- AI Tutor is **closed by default**, opens via the toggle (and `T`), slides smoothly, remembers state.
- Lesson panel is **open by default**, collapsible, and **scrolls with a trackpad** (the reported bug is gone).
- Progress bar + "Mark complete & Next" + Focus mode work; layout + last-lesson persist.
- Mobile uses bottom-sheets; reduced-motion respected.
- Live + healthy; typecheck/build clean. Report what changed.
