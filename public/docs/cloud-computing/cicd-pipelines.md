# CI/CD pipelines that don't break

**Cloud Computing** · Advanced tier · downloadable study notes

---

CI/CD automates build → test → deploy so shipping is boring and safe.

• CI runs on every push: install, lint, type-check, unit + integration tests. Red build → no merge.
• CD deploys passing builds to staging/production automatically.
• Artifact registries store versioned build outputs (container images).
• Blue/green keeps two environments and flips traffic instantly; canary shifts a small % first and watches metrics.

W3Codify itself deploys via GitHub Actions to EC2 — pull, install, migrate, build, reload — the exact pattern you'll build here.

## Code

```yaml
name: deploy
on: { push: { branches: [main] } }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
```

## Study image

Build → test → deploy, with blue/green or canary

## Checkpoint recap

1. **The key difference between blue/green and canary deploys is…**
   - Answer: Blue/green flips all traffic between two full environments; canary shifts a small % first
   - Why: Blue/green is an instant full switch with easy rollback; canary gradually exposes a subset to limit blast radius.

---

© W3Codify — free during launch. Generated study notes.
