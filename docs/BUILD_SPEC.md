# W3Codify — Build Specification

> **Hand this file to Claude Code.** It is the single source of truth for building
> the W3Codify platform. Build in the order given in §16. Treat every "MUST" as a
> hard requirement and every "SHOULD" as a strong default you may improve on.

---

## 1. Product Vision

**W3Codify** is an **online AI‑powered coding school**. Students enroll in
live + self‑paced cohorts, watch lessons, build projects, and learn with an
**always‑on AI tutor** that explains code, reviews submissions, and answers doubts
24/7. The marketing surface (home, courses, single‑course) must feel like a
**$10M, category‑leading product** — cinematic, fast, and conversion‑obsessed.
The app surface (profile, classroom, AI tutor) must feel like a focused, premium
learning workspace.

**One‑line positioning:** *"Learn. Build. Get Placed — with an AI mentor in your corner."*

**Primary conversion goal:** get a visitor to **enroll in the free course** (low‑friction
phone signup) and then upsell into paid cohorts.

**Audience:** India‑first (₹ pricing, phone‑first auth, WhatsApp consent), students &
early‑career devs aged 18–28. Mobile traffic is majority — **mobile‑first, always.**

---

## 2. Non‑Negotiables (the "$10M feel")

- **Performance:** Lighthouse ≥ 95 (Perf/SEO/Best‑Practices/A11y) on the home page,
  mobile profile. LCP < 2.0s on 4G, CLS < 0.05, TBT < 200ms.
- **Motion with taste:** scroll‑reveal, kinetic hero, magnetic CTAs, smooth scroll —
  but never janky and always respecting `prefers-reduced-motion`.
- **Accessibility:** WCAG 2.1 AA. Keyboard‑navigable, focus‑visible, semantic HTML,
  proper contrast on the dark theme.
- **SEO:** SSR/SSG marketing pages, OpenGraph + Twitter cards, JSON‑LD (`Course`,
  `Organization`, `BreadcrumbList`), sitemap, robots.
- **Responsive:** flawless at 360px, 768px, 1024px, 1440px, 1920px.
- **Polish:** no layout shift, skeleton loaders, optimistic UI, empty/error/loading
  states for every async surface.

---

## 3. Tech Stack (use exactly this unless you can justify better)

### Frontend
| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC, TypeScript, Turbopack) | SSR/SSG for SEO, route handlers for API |
| Styling | **Tailwind CSS v4** + CSS variables design tokens | Token‑driven theme (§5) |
| Components | **shadcn/ui** (Radix primitives) | Accessible, unstyled base we theme |
| Animation | **Framer Motion** + **Lenis** (smooth scroll) | GSAP allowed for hero only |
| 3D / hero FX | **Spline** embed *or* lightweight **Three.js / shader gradient** | Lazy‑loaded, never blocks LCP |
| Icons | **lucide-react** | |
| Forms | **React Hook Form** + **Zod** | Shared Zod schemas FE+BE |
| Data fetching | **TanStack Query** (client) + RSC (server) | |
| Light client state | **Zustand** | cart/UI only |
| Fonts | Display: **Clash Display** / **Satoshi** (Fontshare). Body: **Inter** / **Geist** | self‑host via `next/font` |

### Backend
| Concern | Choice | Notes |
|---|---|---|
| Runtime | **Next.js Route Handlers** (monolith) | One repo, fast to ship. Scale path: extract to a NestJS service later. |
| ORM | **Prisma** | |
| DB | **PostgreSQL 18 on AWS RDS** (already provisioned, `ap-south-1`) | DB name `w3codify` (create it) |
| Auth | **Auth.js (NextAuth v5)** — Google OAuth + custom **Phone‑OTP** credentials | §11 |
| OTP / SMS / WhatsApp | **MSG91** (India) or Twilio | OTP login + WhatsApp notifications |
| Bot protection | **Google reCAPTCHA v3** | on Register + Request Callback |
| Object storage | **AWS S3** (`ap-south-1`) + **CloudFront** | avatars, assets |
| Video | **Mux** (preferred) or S3 + CloudFront HLS | adaptive streaming, signed playback |
| Payments | **Razorpay** | ₹ checkout for paid cohorts |
| Email | **AWS SES** or **Resend** | transactional |
| AI | **Multi-provider w/ fallback** — OpenAI (primary) → Gemini (fallback), Anthropic optional. One abstraction, uniform streaming. | §8 |

### Infra / DevOps
- **Host:** existing **EC2 (Ubuntu 26.04, ap‑south‑1)** behind **Nginx** reverse proxy, app under **PM2** (or Docker Compose).
- **TLS:** Let's Encrypt (Certbot) for `w3codify.com`.
- **CI/CD:** **GitHub Actions** → build → SSH deploy to EC2 (`git pull` + `pnpm i` + `prisma migrate deploy` + `pm2 reload`). The repo→EC2 pull path is already wired.
- **Package manager:** **pnpm**.
- **Node:** 22 LTS.

---

## 4. Information Architecture (routes)

```
/                         Home (marketing, SSG)
/courses                  Course catalog (SSG + client filter)
/courses/[slug]           Single course (SSR, JSON-LD)
/about                    About us
/auth/signin              Phone-OTP + Google
/auth/signup              Register (name, phone, email, consent, reCAPTCHA)
/profile                  Profile (protected) — Basic / Professional / Batches / Projects
/classroom                Enrolled student dashboard (protected)
/classroom/[courseId]     Course player (lessons, video, AI tutor) (protected)
/admin                    Admin dashboard (ADMIN only)
/admin/courses            Course CRUD + curriculum builder
/admin/courses/[id]       Edit course → sections → lessons (rich content + media)
/admin/instructors        Instructor CRUD
/admin/students           Student list / enrollments
/admin/leads              Request-callback leads (kanban: new→contacted→closed)
/admin/media              Media library (upload/manage Whisk images & video)
/legal/privacy /terms     Legal
  (modal) Request Callback — global, openable from nav on any page
```

> **The course catalog is fully CMS‑driven.** We seed 3 courses (§7.1) but **all courses,
> sections, lessons, prices, and images are created/edited by admins in `/admin`** — no
> code change needed to add a course. The marketing/catalog pages read from the DB.

**Nav (signed out):** Home · Courses · About Us · Request Callback — **[ Sign In ]** ← rendered as the **bold primary CTA button** (it replaces the old "Start Journey" button; there is no separate Start Journey or Bootcamp link anymore).
**Nav (signed in):** Home · Courses · Classroom · Request Callback — **Avatar ▾** (Profile, Classroom, Logout)

> **Removed:** the **Bootcamp** nav item/page and the standalone **"Start Journey"** CTA.
> The primary call-to-action everywhere is now **Sign In** (styled as the prominent
> gradient button). Any old `/bootcamp` route should 301 → `/courses`.

---

## 5. Design System (the crown jewel)

### 5.1 Brand & Color Tokens — "Indigo & Cyan" (premium dark)
Dark, cinematic, high‑contrast. Primary = **indigo‑violet**, accent = **cyan**.
**No orange anywhere** — replace every previous orange usage with these tokens.

```css
/* tokens.css — expose as CSS variables + Tailwind theme */
--bg:            #0A0B14;   /* near-black indigo canvas */
--bg-elevated:   #14162B;   /* cards */
--bg-subtle:     #1B1E36;   /* inputs, hover */
--border:        #2A2E4A;
--fg:            #EDEEF7;   /* primary text */
--fg-muted:      #9AA0C0;   /* secondary text */
--brand:         #6D5EF6;   /* primary indigo-violet (CTAs) */
--brand-600:     #5A4BE0;   /* hover/pressed */
--brand-glow:    #8B7DFF;   /* glow/lighten */
--accent:        #22D3EE;   /* cyan highlights */
--accent-grad:   linear-gradient(135deg,#8B7DFF 0%,#6D5EF6 45%,#22D3EE 100%);
--success:       #34D399;
--live:          #FB7185;   /* "LIVE" badge (rose, reads on dark) */
--ring:          #6D5EF6;
```
- Light mode is **optional** (ship dark first; the marketing site is dark‑only).
- Use the indigo→cyan **sparingly** — for the primary CTA (**Sign In**), key highlights,
  the "LIVE" badge, and single hero accent words (e.g. the boxed word *Companies* / *Placed*).
- The hero/CTA gradient uses `--accent-grad` (violet→cyan). Glows and focus rings use `--ring`.

### 5.2 Typography
- **Display** (hero, section titles): Clash Display / Satoshi — tight tracking, heavy
  weight, large (clamp 2.5rem → 5.5rem). Mixed‑weight headlines allowed.
- **Body:** Inter/Geist, 16px base, 1.6 line‑height, `--fg-muted` for paragraphs.
- Use **fluid type** (`clamp()`); never fixed px for headings.

### 5.3 Spacing, Radius, Elevation
- 4px spacing scale. Section vertical rhythm: 96–160px desktop, 64–88px mobile.
- Radius: inputs/buttons `12px`, cards `16–20px`, modals `20px`.
- Elevation via subtle borders + soft glows, **not** heavy shadows (dark theme).
- Glassmorphism for the sticky nav and floating cards (`backdrop-blur`, 6–10% white overlay).

### 5.4 Motion language
- **Lenis** smooth scroll site‑wide.
- Section entrances: fade + 16–24px rise, staggered children, triggered at 15% in view.
- **Magnetic** primary buttons; subtle scale + glow on hover.
- Animated number counters for stats (600k, 1M…).
- Marquee row of tech logos (HTML/CSS/JS/React/Node/Python/AI…), infinite, pauses on hover.
- Respect `prefers-reduced-motion`: disable parallax/marquee, keep opacity fades.

### 5.5 Core components (build as reusable, themed shadcn)
Button (primary/secondary/ghost/link), Input, Select, Checkbox, Textarea, OTP input,
Badge (incl. LIVE + discount), CourseCard, Modal/Dialog, Sheet (mobile nav), Avatar,
Dropdown menu, Accordion (FAQ), Tabs, Tooltip, Toast, Skeleton, StatCounter, Marquee,
SectionHeading, GradientText, Navbar, Footer.

### 5.6 God‑Level Frontend Standard (MANDATORY)
This is the bar. "Basic" works; "advanced" looks nice; **we ship god‑level** — the
combined effect that makes users say *"this feels premium."* Apply per the **Scope**
column (M = Marketing pages, A = App/Classroom/Dashboard, ✓ = everywhere).

| # | Dimension | God‑level requirement | Scope |
|---|---|---|---|
| 1 | **Visual design** | Pixel‑perfect alignment, visual rhythm, sophisticated gradients, custom illustrations, instantly recognizable brand identity (think Apple / Stripe / Linear) | ✓ |
| 2 | **Performance** | **Lighthouse 100** target, first load < 1s, optimized/next‑gen images, lazy‑load, code‑split, tree‑shake, CDN + edge rendering, smart caching — page feels *instant* | ✓ |
| 3 | **Animation & motion** | Physics‑based (spring) animations, shared‑element transitions, scroll storytelling, microinteractions, **motion that communicates state** | ✓ |
| 4 | **Responsiveness** | Perfect at 320px → foldables → tablet → laptop → ultrawide → 4K. Nothing stretched or cramped | ✓ |
| 5 | **Accessibility** | Full keyboard nav, screen‑reader support, ARIA, AA contrast, **reduced‑motion mode**, focus management, accessible forms | ✓ |
| 6 | **UX clarity** | User never asks *"where do I click / what happened / did it save?"* — always surface state, progress, errors, success, loading | ✓ |
| 7 | **Forms** | Inline validation, **auto‑formatting** (e.g. `9876543210` → `+91 98765 43210`), password/OTP UX, autosave + draft recovery, smart suggestions, autofill | ✓ |
| 8 | **Data viz** | Interactive charts, drill‑down, realtime, filters, export (Recharts / ECharts / D3) | A (classroom progress, admin) |
| 9 | **Search** | Instant, fuzzy, typo‑tolerant, recent + suggestions, full keyboard nav (Google/Amazon‑class) | M (courses) · A |
| 10 | **Realtime** | Notifications, presence, live dashboards, AI‑tutor live stream | A |
| 11 | **State mgmt** | Never lose user data, never unexpectedly refresh, never show stale data — TanStack Query + Zustand used *properly* | ✓ |
| 12 | **Error handling** | Human messages ("Something went wrong. Try again.") + retry + logging + recovery path — never a raw 500 | ✓ |
| 13 | **Frontend security** | XSS protection, CSP, secure cookies, CSRF, input sanitization | ✓ |
| 14 | **Progressive enhancement** | Usable on slow networks / old devices / partial JS failure | ✓ |
| 15 | **Advanced interactions** | Drag‑drop, resizable panels, multi‑select, keyboard shortcuts, **command palette (⌘K)** (VS Code / Notion class) | A |
| 16 | **Personalization** | Theme prefs, remembered layouts, localization‑ready, custom dashboards | A |
| 17 | **Mobile excellence** | Touch gestures, swipe actions, bottom‑sheet UIs, haptics where supported — native‑like feel | ✓ |
| 18 | **Offline / PWA** | Installable, offline access to enrolled lessons, background sync, push notifications | A |
| 19 | **AI features** | Smart search, AI assistant/tutor, recommendations, natural‑language filtering, auto‑summaries | ✓ (see §8) |
| 20 | **Engineering quality** | Clean component architecture, TypeScript strict, tests, CI/CD, monitoring, error tracking, feature flags | ✓ |

**God‑Level Checklist — every page must pass:**
`✅ Beautiful design  ✅ Instant performance  ✅ Smooth (spring) animations  ✅ Accessibility
✅ Mobile perfection  ✅ Realtime where relevant  ✅ Excellent forms  ✅ Smart search
✅ Offline (app)  ✅ Personalization  ✅ Security  ✅ AI‑powered  ✅ Zero‑confusion UX
✅ Pixel‑perfect  ✅ Robust engineering`

> Prioritization for v1: items **1–7, 11–14, 17, 19, 20 are required on launch**
> (especially across the marketing pages). Items **8–10, 15–16, 18** are required for the
> **App/Classroom** surface and may land in the classroom milestone (§16 steps 10–11).
> Nothing on this list is "nice to have" long‑term — it's the definition of done.

---

## 6. Page Specs

### 6.1 HOME `/` — *make this the best page in our space*
A long, scroll‑driven narrative. Sections, in order:

1. **Sticky glass navbar** — logo (mark + "W3Codify"), centered pill nav, right‑side
   Sign In / Avatar. Shrinks + increases blur on scroll. Mobile: hamburger → full‑screen sheet.
2. **Hero** (full viewport):
   - Eyebrow: `LEARN. BUILD. GET PLACED.` (letter‑spaced, brand color).
   - Kinetic headline: **"Become The Software Engineer That `[Companies]` Want To Hire!"**
     — the accent word "companies" must render **cleanly** with the indigo→cyan accent.
     ⚠️ **FIX the broken box:** the current animated box/outline mis-renders (offset/overflowing
     border). Use a **reliable** accent treatment instead — gradient‑filled text, a clean
     highlight, or a tidy underline that animates in. **No fragile hand-drawn box** that breaks
     across line-wraps or viewport sizes. Verify it looks perfect at 360/768/1440px.
   - Subcopy: community + outcomes one‑liner.
   - ⚠️ **NO hero buttons.** Remove **both** "Start Journey" and "Watch Demo" from the hero.
     The single primary CTA is **Sign In** in the sticky navbar (gradient button) — it's always
     visible, so the hero stays clean. (If a demo is wanted later, it returns as a small text link.)
   - ⚠️ **Remove the stacked-avatar row** (the "A S R P K" letter circles — they render as broken
     placeholders). Keep the social proof as a **plain text stat** only: "1M+ students learning in
     our mastery programs" (no avatar cluster), or drop it into the stat band below.
   - ⭐ **Background effect (make it striking):** the hero MUST have a living animated
     background — an **indigo→cyan aurora / animated gradient‑mesh / subtle shader or
     particle field**, with a faint grid and slow parallax drift. It should feel premium and
     alive (think Linear/Vercel hero), GPU‑light, lazy‑loaded so it never blocks LCP, and it
     **must respect `prefers-reduced-motion`** (fall back to a static gradient). On‑brand
     indigo/cyan only — no orange. This is a priority polish item.
3. **Trust strip / stat band:** animated counters — `600k+ Subscribers`, `1M+ Learners`,
   placement %, avg package — with a faint "make it happen" kinetic text behind.
4. **AI Tutor teaser (our differentiator):** an interactive mini‑demo — user types a
   coding doubt, a faked/streamed answer types out (wire to Claude API in §8). Headline:
   *"Stuck at 2AM? Your AI mentor never sleeps."*
5. **Featured courses carousel:** 3–6 `CourseCard`s (LIVE badge, tags, title, struck
   price + discount), "View all courses →".
6. **Why W3Codify** — feature grid (6 cards w/ icon, hover micro‑interaction): Live cohorts,
   AI doubt‑solving, Real projects, Placement support, Community, Industry mentors.
7. **Learning path / roadmap** — animated horizontal/vertical timeline (Foundations →
   Projects → Specialization (GenAI/DSA/Full‑Stack) → Placement).
8. **Outcomes / placements** — logo wall of hiring companies (greyscale→color on hover),
   salary/placement stats, 2–3 success snapshots.
9. **Instructor spotlight** — mentor cards with photo, role, socials.
10. **Testimonials** — auto‑scrolling marquee of student quotes + avatars + ratings.
11. ~~Pricing / cohorts~~ — **REMOVED.** Everything is FREE (launch offer), so the 3‑tier
    pricing section is gone. Do not render it. (Re‑introduce only if/when paid cohorts return.)
12. **FAQ** — accordion.
13. ~~Big CTA band~~ — **REMOVED / replaced.** Drop the old orange phone‑capture gradient band.
    Replace with EITHER (a) nothing (let the FAQ flow into the footer), OR (b) a clean on‑brand
    **banner** — a slim indigo/cyan panel or a **banner image** (placeholder until art is ready,
    name it `public/images/home/cta-banner.png`) with a single **Sign In** CTA. No phone capture.
14. **Footer** — rich: brand blurb, course links, company, legal, socials, newsletter,
    "Made in India" line. Subtle top border glow.

> Copy may be improved by you, but keep the boxed‑accent‑word hero device and the
> outcome‑driven tone. Every section must scroll‑reveal and be mobile‑perfect.
> **Removed sections:** Pricing (#11) and the old CTA phone‑capture band (#13).

### 6.2 COURSES `/courses`
- Section heading: eyebrow `COURSES`, title **"Level Up Your Coding Skills With Expert‑Led Courses"**.
- Filter/search bar (by tag: Full‑Stack, GenAI, DSA, Data Science…; by level; by Live/Self‑paced).
- Responsive grid of `CourseCard`: thumbnail (instructor image), top‑right **LIVE** badge,
  tag chips, title, **₹ price struck + discounted price + "% OFF"**, rating, CTA → single course.
- Empty/loading skeletons. SSG + client‑side filtering.

### 6.3 SINGLE COURSE `/courses/[slug]`
Udemy‑class layout:
- Left/main: breadcrumb, title, short description, rating + #ratings + #learners, instructor(s),
  last‑updated, language, **"What you'll learn"** checklist grid, curriculum accordion
  (sections → lessons w/ durations, free‑preview markers), requirements, full description,
  related topics chips, reviews.
- Right: **sticky enroll card** — preview video thumbnail (opens player), price (or **Free**),
  **Enroll Now** (auth‑gated → creates enrollment), "This course includes" list
  (hours on‑demand video, downloadable resources, mobile/TV access, certificate),
  share, wishlist.
- JSON‑LD `Course`. OG image per course.

### 6.4 SIGN IN — passwordless EMAIL-OTP, no signup (the ONLY auth flow) ⭐
**Goal: the lowest-friction join possible.** No password, no signup step. One screen.
- Single centered card, **just one field: Email.** CTA **"Continue"** (the bold gradient button).
- On submit → generate a 6-digit OTP, **email it via SMTP** (§11), show the **OTP input**
  ("Enter the 6-digit code sent to your email" + change-email + resend-with-cooldown).
- On verify:
  - If the email has **no account → silently create one** (passwordless, `emailVerified=now`).
  - If it exists → sign them in. **Same screen for new and returning users** — they never
    "sign up". Session-based (Auth.js).
- **First-login onboarding (only the very first time):** after the OTP succeeds and the user
  was just created, show a small **welcome step** asking **Name** and **Contact (phone)** —
  with a prominent **"Skip for now"** button. Saved to their profile; they can fill it later
  in `/profile`. Never block entry on it.
- Optional: keep **"Continue with Google"** below a divider **only if** Google is configured;
  otherwise hide it. No reCAPTCHA required for the email step (rate-limit instead).
- On success → redirect to `/classroom` (or the intended route).

### 6.5 SIGN UP — REMOVED (merged into Sign In)
There is **no separate signup**. `/auth/signup` 301-redirects to `/auth/signin`. Accounts are
created automatically on first successful email-OTP. The name/contact that used to be a signup
form is now the optional, skippable **first-login onboarding** above.

### 6.6 REQUEST CALLBACK (global modal)
Openable from nav on any page. Dialog **"Request a Callback"**, subcopy.
- Fields: **Name**, **Phone no.** (country‑code select, default +91),
  **Enquiry For** (select: *Online Course (Website)*, *Offline Course*),
  **How can we help you?** (textarea).
- **reCAPTCHA v3**. CTA **"Book My Callback"** → stores lead + email/WhatsApp notify ops.
- Success state inside modal; graceful error.

### 6.7 PROFILE `/profile` (protected)
Two‑column app layout (matches reference):
- **Left sidebar:** "My Profile", avatar (upload → S3), name + **STUDENT** badge,
  section nav: **Basic Info**, **Professional**, **Your Batches**, **My Projects**;
  mini‑stats: **Purchased Batches**, **Enrolled Batches**.
- **Main — Basic Info:** *Personal Information* (First/Last Name, Email, Contact,
  Date of Birth, Bio) + *Location & Professional* (City, State, Pincode, Country).
  **Edit Profile** / **Log Out** actions. Inline validation, optimistic save, toasts.
- **Professional:** work + education details. **Your Batches:** enrolled/purchased cohorts.
  **My Projects:** submitted projects (title, repo link, status).

### 6.8 CLASSROOM `/classroom` + `/classroom/[courseId]` (protected)
- Dashboard: enrolled courses, progress rings, "continue learning", upcoming live sessions.
- Course player: lesson list + progress, the **multi‑format lesson body** (§6.8.1), resources,
  and the **AI Tutor panel** (§8) docked beside it with full lesson context.

#### 6.8.1 Lessons are MULTI‑FORMAT & INTERACTIVE (not video‑only) — REQUIRED
A lesson is **never** just a video. Every lesson renders an ordered stack of **content
blocks** (the `LessonBlock` model), and a well‑formed lesson MUST mix several formats:

- **Text** — rich written explanation (headings, lists, bold) — the backbone of the lesson.
- **Video** — short focused clips (Mux/HLS), not the only content.
- **Documents** — downloadable **PDF / notes / cheat‑sheets / slides** (FILE blocks → S3).
- **Code** — syntax‑highlighted, copyable snippets.
- **Study images / diagrams** — the photoreal concept art (see image prompt pack).
- **Callouts** — tips, warnings, "key idea" notes.
- **Quiz checkpoints** — **inline questions every few sections to test the student**
  (MCQ / multi‑select / true‑false), with **instant feedback + explanation**, so learning
  is active. A lesson SHOULD contain at least one checkpoint; longer lessons several.

**Interactivity requirements:**
- Quiz checkpoints score inline, show the correct answer + a short "why", and feed a
  per‑lesson **knowledge score** (stored on `Enrollment.progress`).
- A lesson is only "complete" when its video(s) are watched **and** its checkpoints passed.
- Code blocks are copyable; documents are downloadable; images open in a lightbox.
- End‑of‑section **mini‑recap** + a short quiz; end‑of‑course **final assessment** →
  unlocks the certificate.
- The **AI Tutor** sees the current block's content, so "explain this" / "I got the quiz
  wrong, why?" is context‑aware.

> Admin authors all of this in the lesson‑block editor (§6.9). Seeded courses must ship
> with **real** multi‑format lessons (text + video placeholder + a document + images +
> at least one quiz checkpoint each), using the curriculum in `docs/CURRICULUM.md`.

---

### 6.8.2 INTERACTIVE CODE PLAYGROUND — ❌ REMOVED (do NOT rebuild)
> **This feature has been removed** (see `docs/FEATURE_remove-playground.md`). The standalone
> `/playground`, the Monaco editor, the sandboxed code runner (`/api/run`, Wandbox/Judge0/Piston,
> `RUNNER_PROVIDER`), the in-lesson runnable `CODE_EXERCISE` editor/grading, the `CodeSubmission`
> model, and the `code_playground` feature flag are all gone — Monaco was multi-MB and the runner
> is not core to the course platform.
>
> **Still true:** the `CODE_EXERCISE` value remains in the `BlockType` enum (Postgres can't easily
> drop an enum value); any legacy `CODE_EXERCISE` lesson blocks now render as **static, read-only,
> syntax-highlighted code snippets** (the lightweight `CODE` block). Lesson completion is gated on
> **video watched + quiz checkpoints passed** only. Do NOT re-add Monaco, a code runner, or
> `RUNNER_PROVIDER`.

---

### 6.9 ADMIN PANEL `/admin/*` (ADMIN role only) — the content engine
This is how the team runs the school without touching code. Protected by middleware
(role = ADMIN), its own clean app shell (sidebar nav, breadcrumb, command palette ⌘K).

- **Dashboard:** KPIs — total students, active enrollments, revenue (₹), new leads,
  course completion — with charts (Recharts) and recent activity.
- **Courses CRUD + Curriculum Builder:** create/edit a course (title, slug auto‑gen,
  subtitle, description (rich), tags, level, price/MRP, `isLive`, thumbnail, preview video,
  instructors). **Drag‑and‑drop curriculum builder**: sections → lessons, reorder, set
  free‑preview, durations. Publish/Unpublish (draft state). Live preview link.
- **Lesson editor (rich):** each lesson is built from **content blocks** (see `LessonBlock`):
  video, rich text, **image/diagram** (from media library — this is where the in‑lesson
  study visuals live), code block (syntax‑highlighted), callout/note, quiz/MCQ, file/resource,
  embed. Reorderable. This is what makes lessons visual and "fun to study".
- **Instructors CRUD:** name, role, bio, photo, socials.
- **Students & Enrollments:** searchable table, view a student, grant/revoke access, refunds.
- **Leads (Request Callback):** kanban board (new → contacted → closed), notes, assignee,
  export CSV.
- **Media Library:** upload to S3, grid view, tag/search, reuse across lessons & pages —
  the home for all Whisk‑generated images. Shows usage. (See `WHISK_IMAGE_PROMPTS.md`.)
- **Settings:** site config, feature flags, pricing, coupon codes.

All admin mutations: Zod‑validated, optimistic UI, toasts, audit‑logged (`AdminAuditLog`),
soft‑delete where it matters. Tables: sortable, filterable, paginated, bulk actions.

---

## 7. Data Model (Prisma — starting schema; extend as needed)

```prisma
model User {
  id            String   @id @default(cuid())
  firstName     String
  lastName      String?
  email         String?  @unique
  phone         String   @unique
  phoneVerified Boolean  @default(false)
  emailVerified DateTime?
  avatarUrl     String?
  role          Role     @default(STUDENT)
  bio           String?
  dateOfBirth   DateTime?
  city          String?
  state         String?
  pincode       String?
  country       String?
  consentComms  Boolean  @default(true)
  createdAt     DateTime @default(now())
  enrollments   Enrollment[]
  projects      Project[]
  accounts      Account[]   // Auth.js
  sessions      Session[]
  aiThreads     AiThread[]
}

enum Role { STUDENT INSTRUCTOR ADMIN }

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  subtitle    String?
  description String
  thumbnail   String?
  previewVideo String?
  priceInr    Int      @default(0)   // 0 = free
  mrpInr      Int?
  isLive      Boolean  @default(false)
  level       Level    @default(BEGINNER)
  tags        String[]
  rating      Float    @default(0)
  ratingCount Int      @default(0)
  learners    Int      @default(0)
  instructors Instructor[] @relation("CourseInstructors")
  sections    Section[]
  enrollments Enrollment[]
  createdAt   DateTime @default(now())
}

enum Level { BEGINNER INTERMEDIATE ADVANCED }

model Section { id String @id @default(cuid()) courseId String course Course @relation(fields:[courseId],references:[id]) title String order Int lessons Lesson[] }
model Lesson  { id String @id @default(cuid()) sectionId String section Section @relation(fields:[sectionId],references:[id]) title String videoUrl String? durationSec Int @default(0) isFreePreview Boolean @default(false) order Int resources Json? }
model Instructor { id String @id @default(cuid()) name String role String? bio String? photo String? socials Json? courses Course[] @relation("CourseInstructors") }

// Add to Course: status CourseStatus @default(DRAFT)  (DRAFT|PUBLISHED|ARCHIVED) — catalog shows PUBLISHED only.
enum CourseStatus { DRAFT PUBLISHED ARCHIVED }

// Rich lesson content — ordered blocks render the lesson body (admin-built in /admin).
model LessonBlock {
  id        String   @id @default(cuid())
  lessonId  String
  lesson    Lesson   @relation(fields:[lessonId], references:[id])
  type      BlockType
  order     Int
  // shape depends on type: TEXT{md}, IMAGE{mediaId,caption,alt}, CODE{lang,code},
  // VIDEO{url}, CALLOUT{variant,md}, QUIZ{question,options,answer}, FILE{mediaId}, EMBED{url}
  data      Json
  mediaId   String?
  media     MediaAsset? @relation(fields:[mediaId], references:[id])
}
enum BlockType { TEXT IMAGE CODE VIDEO CALLOUT QUIZ FILE EMBED }

// Media library — every uploaded/Whisk image & asset; reused across lessons + pages.
model MediaAsset {
  id        String   @id @default(cuid())
  url       String              // S3/CloudFront URL
  kind      String   @default("image") // image|video|file
  alt       String?
  caption   String?
  width     Int?
  height    Int?
  tags      String[]
  uploadedBy String?
  blocks    LessonBlock[]
  createdAt DateTime @default(now())
}

model AdminAuditLog { id String @id @default(cuid()) actorId String action String entity String entityId String? meta Json? createdAt DateTime @default(now()) }

// NOTE: give Lesson a `blocks LessonBlock[]` relation field.

model Enrollment {
  id        String   @id @default(cuid())
  userId    String   user User @relation(fields:[userId],references:[id])
  courseId  String   course Course @relation(fields:[courseId],references:[id])
  type      EnrollType @default(FREE)
  status    EnrollStatus @default(ACTIVE)
  progress  Json?       // lessonId -> completed
  paymentId String?
  createdAt DateTime @default(now())
  @@unique([userId, courseId])
}
enum EnrollType { FREE PAID }
enum EnrollStatus { ACTIVE COMPLETED CANCELLED }

model Project { id String @id @default(cuid()) userId String user User @relation(fields:[userId],references:[id]) title String repoUrl String? liveUrl String? status String @default("submitted") createdAt DateTime @default(now()) }

model CallbackLead {
  id        String   @id @default(cuid())
  name      String
  phone     String
  enquiryFor String
  message   String?
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model OtpRequest { id String @id @default(cuid()) email String codeHash String expiresAt DateTime attempts Int @default(0) createdAt DateTime @default(now()) }
// NOTE: email-OTP is now the auth flow. User.email is unique + required (primary identifier);
// firstName/phone are optional (captured later via skippable onboarding / profile).

model AiThread { id String @id @default(cuid()) userId String user User @relation(fields:[userId],references:[id]) courseId String? title String? messages AiMessage[] createdAt DateTime @default(now()) }
model AiMessage { id String @id @default(cuid()) threadId String thread AiThread @relation(fields:[threadId],references:[id]) role String content String createdAt DateTime @default(now()) }

// Account/Session/VerificationToken per Auth.js adapter
```

### 7.1 Launch Courses & Curriculum Model
Seed these **3 courses** at launch. Audience = **people who already know the fundamentals**
(not first‑year beginners). Every course follows the same ladder:

```
Index/Overview  →  Basics refresher (2–3 lessons, fast)  →  ADVANCED (the bulk)  →  GOD tier (elite, real-world mastery)
```
The "Basics" section is a quick on‑ramp, **not** a from‑zero teardown — then we jump to
Advanced and finish at GOD level.

| Slug | Title | Arc (Basics → Advanced → GOD) |
|---|---|---|
| `machine-learning-deep-learning` | **Machine Learning & Deep Learning** | refresher (math/ML intuition, sklearn) → advanced (deep nets, CNN/RNN/Transformers, training at scale) → GOD (LLMs, fine‑tuning, RAG, MLOps, research‑grade projects) |
| `cloud-computing` | **Cloud Computing** | refresher (core cloud + Linux/networking) → advanced (compute/storage/DB, IaC, containers, K8s, CI/CD) → GOD (multi‑region architecture, serverless at scale, cost/security, SRE) |
| `cyber-security` | **Cyber Security** | refresher (security fundamentals, networking) → advanced (web/app pentesting, OWASP, tooling, blue‑team) → GOD (red‑team ops, exploit dev, cloud/AppSec, threat hunting) |

Tier visuals come from `WHISK_IMAGE_PROMPTS.md` §B; course cards from §A. Mark each course
`isLive` as appropriate and price the GOD/full track as a paid cohort, with a free intro.

> Build the schema (§7) generically; seed **these three** as starter content, but the
> catalog is unlimited and **fully managed via the Admin Panel (§6.9)** — admins add more
> courses, lessons, and in‑lesson images with zero code changes.

---

## 8. AI Features (the moat — multi-provider with fallback)

**Provider strategy (REQUIRED):** build a single **AI provider abstraction** (`src/server/ai/`)
behind which we run multiple LLM providers with **automatic fallback**:
- **Primary: OpenAI** (`OPENAI_API_KEY`) — default for all AI calls.
- **Fallback: Google Gemini** (`GEMINI_API_KEY`) — used automatically if OpenAI errors,
  rate-limits (429), or times out.
- **Optional: Anthropic** (`ANTHROPIC_API_KEY`) — if set, may be used; otherwise skip.
- Order is config-driven (env, e.g. `AI_PROVIDER_ORDER=openai,gemini`). All providers expose
  the same streaming interface so callers don't care which one answered. Log which provider
  served each request (for debugging), never expose keys client-side.

Models: a capable default per provider (e.g. OpenAI `gpt-4o` / `gpt-4o-mini` for cheap tasks;
Gemini `gemini-2.0-flash` / pro). Keep model IDs in one config map so they're easy to bump.

Every AI feature below routes through this abstraction (so all get the fallback for free):

0. **Site Chatbot (NEW):** a floating assistant available **everywhere** (a launcher button,
   bottom-right) — answers questions about courses, pricing, "which course should I take?",
   and general coding help; can deep-link to courses/sign-up. Streams; rate-limited; works
   signed-out (with light limits) and signed-in (with the user's context).
1. **AI Tutor (in‑classroom):** context‑aware chat docked beside the lesson. System prompt
   includes the current lesson title/transcript + the student's code. Streams responses.
   Persist threads (`AiThread`/`AiMessage`).
2. **Explain this code / Fix my error:** student pastes code or an error; AI returns a
   step‑by‑step explanation and a corrected snippet with a diff.
3. **AI project review:** on project submit, AI gives structured feedback (correctness,
   readability, next steps) — store as a review.
4. **Personalized next step:** based on progress, AI recommends the next lesson/course.
5. **Home‑page teaser:** the interactive demo in §6.1.4 streams a real (rate‑limited,
   unauthenticated‑safe) Claude response so the "wow" is genuine.

**Implementation notes**
- Server‑side only (provider keys never reach the client).
- Stream via Route Handler (`ReadableStream`) → client renders token‑by‑token. The
  abstraction must stream uniformly across OpenAI/Gemini and **fail over mid-list** (if the
  primary throws before streaming, transparently try the next provider).
- Cache static system/context where the provider supports it; cheap tasks → the small model.
- Rate‑limit per user/IP.
- Guardrails: keep the tutor on‑topic (coding/learning), refuse to just hand over
  graded‑assignment answers — coach instead.

---

## 9. API Surface (Route Handlers)

```
POST /api/auth/otp/send        { phone }                 -> sends OTP (rate-limited)
POST /api/auth/otp/verify      { phone, code }           -> session
POST /api/auth/register        { firstName,lastName,phone,email,consent,captcha }
GET  /api/courses              ?tag&level&q              -> list
GET  /api/courses/[slug]                                  -> detail
POST /api/enrollments          { courseId }              -> enroll (auth)
POST /api/payments/razorpay/order   { courseId }         -> order
POST /api/payments/razorpay/verify  { ... }              -> confirm + enroll
GET  /api/profile              (auth)                    -> me
PATCH /api/profile             (auth) { ...fields }       -> update
POST /api/profile/avatar       (auth) multipart          -> S3 upload -> url
POST /api/callback             { name,phone,enquiryFor,message,captcha }
POST /api/ai/chat              (auth) { threadId?,courseId?,message } -> SSE stream
POST /api/ai/explain           { code,language,captcha? } -> stream (home teaser: throttled)

# Admin (ADMIN role; all audit-logged)
GET/POST/PATCH/DELETE /api/admin/courses[/[id]]        course CRUD + publish
POST   /api/admin/courses/[id]/sections                 add/reorder sections
POST   /api/admin/lessons[/[id]]/blocks                 add/reorder/edit lesson blocks
GET/POST/PATCH/DELETE /api/admin/instructors[/[id]]
GET    /api/admin/students            ?q&course          list/search enrollments
GET/PATCH /api/admin/leads[/[id]]                        lead status/notes
POST   /api/admin/media               multipart          -> S3 upload -> MediaAsset
GET    /api/admin/media               ?tag&q             media library
GET    /api/admin/stats                                  dashboard KPIs
```
All inputs validated with **Zod**. reCAPTCHA verified server‑side on register/callback.

---

## 10. Folder Structure

```
src/
  app/
    (marketing)/ page.tsx  courses/  bootcamp/  about/  layout.tsx
    (app)/ profile/  classroom/  layout.tsx        # protected group
    auth/ signin/  signup/
    api/ ...route handlers
    layout.tsx  globals.css
  components/
    ui/            # shadcn primitives (themed)
    marketing/     # Hero, Stats, CourseCarousel, FeatureGrid, Roadmap, Testimonials...
    course/  profile/  classroom/  ai/  shared/
  lib/             # prisma, auth, anthropic, s3, razorpay, msg91, recaptcha, utils
  hooks/  stores/  styles/tokens.css
  server/          # services, validators (zod schemas shared)
prisma/ schema.prisma  migrations/
public/  fonts/  og/
```

---

## 11. Auth & Security

- **Auth.js v5** with a **Credentials provider for EMAIL-OTP** (passwordless): verify the code
  against a hashed `OtpRequest` keyed by **email**, then upsert the `User` (create if new,
  `emailVerified=now`). Google provider optional (only if configured).
- **Email delivery via SMTP** (nodemailer): send the OTP as a clean branded email. Config from
  `SMTP_*` env (Gmail App Password to start — see §12).
- 🔴 **CRITICAL SECURITY — never expose the OTP to the client.** The current phone-OTP code
  RETURNS the code to the browser (`devCode`) and the form displays it whenever SMS isn't
  configured, with **no `NODE_ENV` guard** — so in production anyone can read the code. The
  email-OTP build MUST: only ever `console.log` the code when `NODE_ENV==='development'`,
  **never return it in the API response or render it** in any environment, and in production
  with no SMTP configured **fail hard** ("email not configured") rather than reveal the code.
- 🔴 **Admin identifier must not be public.** The seed hardcodes the admin (`phone 9000000001`,
  `email bradforbes24@hotmail.com`) in the **public repo** — combined with the above, that's a
  one-click admin takeover. Make the admin email come from env (`ADMIN_EMAIL`, not committed),
  rotate it, and never display dev codes for any account.
- OTP: 6‑digit, **10‑min TTL**, max 5 attempts, resend cooldown 30s, **hashed at rest**,
  per‑IP + per‑email rate limit. Generic responses (don't reveal whether an email exists).
- Email is the primary identifier: `User.email` **unique + required**, `emailVerified` set on
  first OTP success; `firstName`/`phone` become optional (filled later via onboarding/profile).
- No reCAPTCHA on the email step (rate-limit + cooldown instead); keep it on the public callback form.
- Sessions: JWT or DB sessions (Prisma adapter). Protect `(app)` group via middleware.
- Security headers (CSP, HSTS, X‑Frame‑Options), CSRF on mutations, input sanitization,
  rate limiting (Upstash/Redis or in‑proc), secrets only in env (never client).
- S3 uploads via presigned URLs; validate mime/size; serve via CloudFront.

---

## 12. Integrations & Env Vars

Create `.env.example` (committed, no secrets). Real `.env` is **gitignored**.

```
DATABASE_URL=postgresql://...@<rds-endpoint>:5432/w3codify?sslmode=require
NEXTAUTH_SECRET=         NEXTAUTH_URL=
# Email-OTP delivery (Gmail App Password to start; later swap to SES/Resend for scale)
SMTP_HOST=smtp.gmail.com SMTP_PORT=587
SMTP_USER=               SMTP_PASS=              SMTP_FROM="W3Codify <you@gmail.com>"
GOOGLE_CLIENT_ID=        GOOGLE_CLIENT_SECRET=   # optional social login
RECAPTCHA_SITE_KEY=      RECAPTCHA_SECRET_KEY=   # callback form only
# MSG91/phone-OTP no longer used for login (email-OTP replaces it)
AWS_REGION=ap-south-1    AWS_ACCESS_KEY_ID=      AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=          CLOUDFRONT_URL=
MUX_TOKEN_ID=            MUX_TOKEN_SECRET=
RAZORPAY_KEY_ID=         RAZORPAY_KEY_SECRET=
ANTHROPIC_API_KEY=
SES_FROM_EMAIL= (or RESEND_API_KEY=)
```

> The RDS instance (`w3codify-db`, ap‑south‑1) and S3/EC2 already exist. **Create the
> `w3codify` database** on RDS before `prisma migrate`. The EC2's security group must
> allow the app host to reach RDS:5432.

---

## 13. SEO, Analytics, Observability
- `next-sitemap`, robots, per‑route metadata, OG images (static + per‑course dynamic via `@vercel/og` style route).
- JSON‑LD: Organization (home), Course (single course), BreadcrumbList.
- Analytics: PostHog or GA4 + event tracking on CTAs/enroll/callback funnel.
- Error tracking: Sentry. Structured server logs.

---

## 14. Quality Bar / Definition of Done
- TypeScript strict, no `any` in app code, ESLint + Prettier clean.
- Every form: Zod‑validated, accessible labels, error + success states.
- Every async surface: loading skeleton + error boundary + empty state.
- Unit tests (Vitest) for lib/validators; e2e smoke (Playwright) for signup→enroll and callback.
- Lighthouse budget met (§2). Reduced‑motion honored. Keyboard nav verified.
- Seed script with demo courses/instructors so the site looks full on first run.

---

## 15. Visual Reference
Original requirement screenshots live in `W3Codify - Requirement Doc/images/`
(home, signin, signup, courses, single‑course, callback, profile). **Match the
information & fields exactly; elevate the visual quality far beyond them.** Keep the
dark + molten‑orange identity and the bold display headlines.

---

## 16. Build Order (do it in this sequence)

1. **Scaffold:** Next.js 15 + TS + Tailwind v4 + shadcn + fonts + `tokens.css` + Lenis. Base layout, Navbar, Footer, Button/Input primitives.
2. **Home page** — full §6.1, all sections, animations, responsive, Lighthouse pass. *(This is the headline deliverable — make it exceptional.)*
3. **Design system page** (`/dev/ui`, non‑prod) showcasing components.
4. **Prisma + RDS** — schema §7, migrate, seed demo data.
5. **Courses** list + **Single course** (with JSON‑LD, sticky enroll).
6. **Auth** — Phone‑OTP + Google, Sign In, Sign Up (+reCAPTCHA), middleware‑protected routes + roles.
7. **Admin Panel** (§6.9) — course CRUD + drag‑drop curriculum builder + **rich lesson block
   editor** + media library (S3) + instructors + leads kanban + students. This is what lets
   you add unlimited courses without code. Build before relying on seed data.
8. **Request Callback** modal + API + lead storage + ops notify.
9. **Profile** — all sections, avatar upload to S3, edit/save.
10. **Enrollment + Razorpay** for paid cohorts.
11. **Classroom** — dashboard + course player rendering **lesson blocks** (incl. study images).
12. **AI Tutor** (§8) — streaming chat, explain/fix, project review, home teaser.
13. **Polish pass** — SEO, analytics, Sentry, a11y audit, perf budget, tests.
14. **Deploy** — Nginx + PM2 on EC2, Certbot TLS, GitHub Actions CI/CD (git pull → migrate → reload).

> After each step: commit + push to `main`; the EC2 pull keeps staging in sync.

---

**Remember:** the home page is the audience magnet — invest disproportionate effort
there. Cinematic, fast, conversion‑first. Build the rest to the same bar.
