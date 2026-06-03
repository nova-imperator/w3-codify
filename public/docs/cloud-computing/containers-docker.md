# Containers & Docker deep dive

**Cloud Computing** · Advanced tier · downloadable study notes

---

A container packages your app with its dependencies into a portable image that runs identically everywhere — solving "works on my machine".

• A Dockerfile is the recipe; docker build produces an image; docker run starts a container.
• Images are layered and cached — order your Dockerfile so dependencies install before code copies for fast rebuilds.
• Push images to a registry (ECR/Docker Hub).
• Run them on ECS/Fargate (serverless containers) or Kubernetes.

Containers share the host kernel (unlike VMs), so they're lightweight and start in milliseconds.

## Code

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

## Study image

Containers share the kernel; VMs ship a whole OS

## Checkpoint recap

1. **Why copy package files and install deps BEFORE copying app code in a Dockerfile?**
   - Answer: Layer caching — deps don't reinstall when only code changes
   - Why: Docker caches layers; putting rarely-changed deps first avoids reinstalling them on every code edit.

---

© W3Codify — free during launch. Generated study notes.
