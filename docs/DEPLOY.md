# W3Codify — Deployment Guide (EC2 + RDS + S3)

> How to get the app running on the existing AWS infra. **Secrets live only in `.env`**
> (gitignored) — you copy that to the server manually; git never carries it.
> Real values (EC2 IP, RDS endpoint, passwords, keys) are in your **local `.env`** — read
> them from there; this guide uses placeholders so it's safe in a public repo.

---

## Infra (already provisioned)
- **EC2:** Ubuntu 26.04, `ap-south-1`. Login: `ubuntu@<EC2_HOST>` with `w3codify-key.pem`.
  Repo already cloned at `~/w3-codify` (git pull updates code).
- **RDS:** PostgreSQL 18, `w3codify-db.<...>.ap-south-1.rds.amazonaws.com:5432`, user `postgres`.
- **S3:** bucket in `ap-south-1` for uploads/media.

---

## 0. Prerequisites on RDS (one-time)
1. **Create the app database** (it doesn't exist yet — only `postgres`/`rdsadmin` do):
   ```sql
   CREATE DATABASE w3codify;
   ```
   (Connect from your machine with any Postgres client using the creds in `.env`.)
2. **Open the security group** so the EC2 app can reach RDS:
   add an inbound rule on `w3codify-db-sg` → **PostgreSQL 5432** → source = the **EC2's
   security group** (or its private IP). Right now EC2→RDS is blocked.

---

## 1. One-time EC2 setup
SSH in: `ssh -i w3codify-key.pem ubuntu@<EC2_HOST>`
```bash
# Node 22 + pnpm + pm2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm i -g pnpm pm2

# app dir (already cloned)
cd ~/w3-codify
```

## 2. Copy secrets to the server (every time `.env` changes)
`.env` is **gitignored**, so push it over SSH from your **local** machine:
```powershell
# from c:\W3Codify on Windows
scp -i C:\W3Codify\w3codify-key.pem C:\W3Codify\.env ubuntu@<EC2_HOST>:~/w3-codify/.env
```
> The app reads DB/AWS/Anthropic/etc. from this file. The GitHub PAT is **not** needed on
> the server (the repo is public; pulls are anonymous) — keep that line out of the server copy.

## 3. Build & run
```bash
cd ~/w3-codify
pnpm install --frozen-lockfile
pnpm prisma migrate deploy      # apply migrations to RDS
pnpm build
pm2 start "pnpm start" --name w3codify   # or: pm2 start ecosystem.config.js
pm2 save && pm2 startup
```
App listens on `PORT` (3000) — proxied by Nginx next.

## 4. Nginx reverse proxy + HTTPS
```nginx
# /etc/nginx/sites-available/w3codify
server {
  server_name w3codify.com www.w3codify.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/w3codify /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d w3codify.com -d www.w3codify.com   # auto-TLS + renewal
```
> Point the domain's A record at `<EC2_HOST>` first. Open EC2 SG inbound 80 + 443.

## 5. Deploys after the first (manual)
```bash
cd ~/w3-codify
git pull
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 reload w3codify
```

## 6. CI/CD (automate step 5)
GitHub Actions on push to `main`: build, then SSH to EC2 and run the step-5 commands.
- Add repo **secrets**: `EC2_HOST`, `EC2_SSH_KEY` (the `.pem` contents), `EC2_USER=ubuntu`.
- Workflow `.github/workflows/deploy.yml` uses an SSH action to run the deploy script.
- `.env` is **never** in CI — it already lives on the server from step 2.

---

## Checklist
- [ ] `w3codify` DB created on RDS
- [ ] RDS SG allows EC2 on 5432
- [ ] Node 22 + pnpm + pm2 + nginx installed on EC2
- [ ] `.env` `scp`'d to `~/w3-codify/.env`
- [ ] `prisma migrate deploy` ran clean
- [ ] app under pm2, proxied by nginx
- [ ] domain → EC2, Certbot HTTPS issued
- [ ] GitHub Actions auto-deploy on push
