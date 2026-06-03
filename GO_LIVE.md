# W3Codify — Go-Live Punch List

All 6 build sessions are shipped and live on **http://13.205.83.45**. What's left is
**wiring, not building.** Work top to bottom; each item is independent.

---

## 1. Activate CI/CD (auto-deploy on push)  ⚠️ blocked by token scope
The workflow is written but sits in `ci/deploy.yml`. GitHub Actions only runs files in
`.github/workflows/`. The deploy PAT **can't move it** (it lacks the `workflow` scope —
push is rejected). Pick ONE fix:

**Option A — via GitHub web (easiest, no token change):**
1. On GitHub → the repo → **Add file → Create new file**.
2. Name it exactly `.github/workflows/deploy.yml`.
3. Paste the contents of `ci/deploy.yml` (everything from `name: Deploy to EC2` down).
4. Commit. (Web commits don't need the `workflow` scope.)
5. Optionally delete `ci/deploy.yml`.

**Option B — regenerate the PAT with the scope:**
1. Create a new token **with the `workflow` permission** (classic: tick `workflow`;
   fine-grained: **Workflows → Read and write**).
2. Put it in local `.env`, then I (or you) can `git mv ci/deploy.yml .github/workflows/` and push.

**Then add repo Secrets** (Settings → Secrets and variables → Actions → New secret):
| Secret | Value |
|---|---|
| `EC2_HOST` | `13.205.83.45` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | full contents of `w3codify-key.pem` |

✔️ Done when: a push to `main` shows a green run under the repo's **Actions** tab and EC2 updates itself.

---

## 2. HTTPS / custom domain  ⚠️ port 443 currently closed
The site is HTTP-only because no domain is pointed at the box yet.
1. Buy/choose a domain (e.g. `w3codify.com`).
2. Add a DNS **A record** → `13.205.83.45` (and `www` too). Open EC2 SG inbound **80 + 443**.
3. On EC2, set up Nginx + Certbot (DEPLOY.md §4):
   ```bash
   sudo apt-get install -y nginx certbot python3-certbot-nginx
   # add the Nginx server block from DEPLOY.md §4, then:
   sudo certbot --nginx -d w3codify.com -d www.w3codify.com
   ```
4. Update `.env` on EC2: `AUTH_URL=https://w3codify.com` (and `NEXTAUTH_URL`), then `pm2 reload`.

✔️ Done when: `https://w3codify.com` loads with a valid lock and sign-in callbacks use the https domain.

---

## 3. Switch features from dev-fallback → real (add keys to `.env`)
Each is coded and dormant; it activates the moment its key is present. After adding any,
**re-`scp` `.env` to EC2 and `pm2 reload`** (DEPLOY.md §2).

| Feature | Env var(s) | Get it from | Impact |
|---|---|---|---|
| **AI Tutor / teaser / reviews** ⭐ | `ANTHROPIC_API_KEY` | console.anthropic.com | Real Claude instead of mock — the headline feature |
| Avatar / media uploads | `S3_BUCKET_NAME` (+ AWS keys already present) | AWS S3 | Real S3 uploads instead of URL fallback |
| Phone OTP texts | `MSG91_AUTH_KEY` (+ sender/template) or Twilio | msg91.com / twilio.com | Real SMS instead of on-screen code |
| Google sign-in | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | console.cloud.google.com | "Continue with Google" button |
| Bot protection | `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | google.com/recaptcha/admin | reCAPTCHA on signup/callback |
| Analytics | `POSTHOG_KEY` (or GA id) | posthog.com | Funnel tracking |
| Error tracking | `SENTRY_DSN` | sentry.io | Crash/error reports |
| Paid courses (later) | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | razorpay.com | Only when you set a real price; FREE now |

> Google OAuth + reCAPTCHA ask for your site URL — add `http://localhost:3000`,
> `http://13.205.83.45`, and your https domain.

---

## 4. Minor polish (optional)
- Add `<link rel="canonical">` per route (small SEO win).
- Add a PWA `manifest.webmanifest` (currently 404) for installability.
- Flip **Cyber Security** to LIVE in admin if you want its LIVE badge.

---

## Suggested order
1. **`ANTHROPIC_API_KEY`** (makes the AI real — biggest visible win, 2 min).
2. **Domain → HTTPS** (looks legit, fixes auth callbacks).
3. **CI/CD** (so you stop deploying by hand).
4. The rest of the keys as you need them.

> Reminder: `.env` is gitignored — it never goes to GitHub. After editing it locally,
> `scp` it to `~/w3-codify/.env` on EC2 and `pm2 reload` for changes to take effect.
