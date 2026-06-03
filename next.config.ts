import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // On the small EC2 box, set DISABLE_WEBPACK_CACHE=1 to skip the large
  // .next/cache pack file and avoid running out of disk during builds.
  webpack: (config) => {
    if (process.env.DISABLE_WEBPACK_CACHE === "1") config.cache = false;
    return config;
  },
  // On the tiny EC2 box (≈900 MB RAM), SKIP_BUILD_CHECKS=1 skips the in-build
  // type-check + lint (already run locally and in CI) so the build doesn't OOM.
  typescript: { ignoreBuildErrors: process.env.SKIP_BUILD_CHECKS === "1" },
  eslint: { ignoreDuringBuilds: process.env.SKIP_BUILD_CHECKS === "1" },
  // We deploy with `next start` (not standalone output), so per-route file
  // traces aren't used at runtime. Excluding the giant SDKs keeps the
  // "Collecting build traces" step from OOM-crashing on the small box.
  outputFileTracingExcludes: {
    "**/*": [
      "**/node_modules/@aws-sdk/**",
      "**/node_modules/@smithy/**",
      "**/node_modules/@sentry/**",
      "**/node_modules/@opentelemetry/**",
      "**/node_modules/@img/**",
      "**/node_modules/@playwright/**",
      "**/node_modules/playwright*/**",
      "**/node_modules/@prisma/engines/**",
      "**/node_modules/prisma/**",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
