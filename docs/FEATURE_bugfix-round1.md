# Bug-fix Round 1 (from QA pass)

> **Worker session.** Fix these bugs, then ship end-to-end. Manager keeps specs in `docs/`.

## Project context
- Repo `nova-imperator/w3-codify`; Next.js 15 + Prisma; live **https://w3codify.com**; EC2 `ubuntu@13.205.83.45` (t3.small, 2 GB), key `C:\W3Codify\w3codify-key.pem`.
- Read `docs/BUILD_SPEC.md` (§5 Indigo & Cyan, §6.6 callback, §6.8 classroom) and `docs/DEPLOY.md`.
- Build per DEPLOY.md §5; reload only if `.next/BUILD_ID` exists; **never `pkill -f next`** (kills the app); never pipe build through tail/head.
- ⚠️ The **email-OTP/Turnstile** work is uncommitted WIP in the tree — don't touch those files (`.env`, `.env.example`, `mailer.ts`, `turnstile*`, `sign-in-form.tsx`, `api/auth/otp/send`).

## UI / CSS
1. **Heading spacing** — display-font headings render cramped (e.g. "Request a Callback", "Cyber Security", "Prompt Engineering"). The `tracking`/letter-spacing on the display font is too tight and/or word-spacing is collapsing. Fix the display-heading style so words read clearly (loosen tracking slightly; verify across the callback modal title, course titles, hero). Audit globally, not just one spot.
2. **Country-code alignment** (Request a Callback → Phone no.) — the `IN +91` selector box and the phone `<input>` aren't vertically aligned / same height. Align them cleanly (same height, baseline, gap).
3. **Accordion padding** — the FAQ accordion items have wrong/tight padding. Fix to comfortable, consistent padding.
7. **Hero "2AM"** — copy reads "Stuck at 2AM?" with no space. Change to **"Stuck at 2 AM?"** (and confirm it's a real space, not a kerning collapse).

## Validation
4. **Name field** (Request a Callback) accepts numbers/symbols (`9283:$%$%@$#E~~~~`). Add validation: letters, spaces, and basic punctuation (`. ' -`) only, length 2–60, no leading/trailing space. Show an inline error; block submit. Apply the same rule server-side in the `/api/callback` Zod schema (defense in depth). If a "name" field exists in onboarding/profile, apply there too.

## Functional
5. **Footer social icons don't navigate** — Instagram, LinkedIn, X/Twitter, YouTube, GitHub icons have no working link. Wire each `<a href>` to the real handle, `target="_blank" rel="noopener noreferrer"`. **NEED FROM OWNER:** the real social URLs (until provided, point them to placeholders the owner can edit in one place, e.g. a `SOCIALS` map in `src/lib/site.ts`, and don't render an icon whose URL is empty).
6. **Chatbot scroll** — when the cursor is over the chatbot panel, the wheel scrolls the *page* instead of the chat messages. Likely **Lenis smooth-scroll** capturing the wheel. Fix: make the chatbot message list a real scroll container (`overflow-y:auto; overscroll-behavior:contain`) AND exclude it from Lenis (Lenis supports `data-lenis-prevent` on the scrollable element — add it), so scrolling inside the chat scrolls the chat, not the page.
8. **Search "testing" → Cyber Security** — search matches the substring inside "Pen**testing**". Decide intent: tighten relevance so a query matches **whole words** in title/tags (or rank title/tag/word-boundary matches above mid-word substring matches). At minimum, mid-word substring hits shouldn't outrank nothing — make results feel right for short queries. (Low priority; don't over-engineer.)
9. **OTP not received / in spam** — email deliverability. Coordinate with the email-OTP WIP (don't edit its files; flag to that worker). Improvements: a clear `From` name + subject, both text+HTML parts, and — the real fix — **SPF/DKIM/DMARC** DNS records for the sending domain (or move from Gmail SMTP to SES/Resend). **NEEDS OWNER DNS action**; document exactly what records to add.
10. **Video doesn't resume** — playback restarts at 0 after navigating away and back. Save the video `currentTime` (throttled, e.g. every 5 s + on pause/unmount) per user+lesson, and seek to it on load (resume). Persist to `Enrollment.progress` (or localStorage as a quick win) and tie into the §6.8 "resume where you left off". Don't reset to 0 on remount.

## Acceptance
- Headings read cleanly (not cramped); callback country-code aligned; accordion padding good; hero says "2 AM".
- Name field rejects numbers/symbols (client + server).
- Footer social icons open the right sites in a new tab (or are hidden if no URL).
- Scrolling over the chatbot scrolls the chat, not the page.
- Video resumes from where the user left off.
- Search relevance for short queries feels reasonable.
- Live + healthy; typecheck/build clean. Report each bug's status (fixed / needs-owner-input).
