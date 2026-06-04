import { initSentryClient } from "@/lib/sentry-client";

/**
 * Next.js client instrumentation (Next 15.3+ auto-loads this file in the
 * browser). On the pinned Next 15.1 build it isn't auto-loaded yet — the
 * <Observability> provider calls the same idempotent init — but keeping it here
 * means client error capture starts working the moment Next is upgraded, with
 * no further changes. No-op without NEXT_PUBLIC_SENTRY_DSN.
 */
initSentryClient();
