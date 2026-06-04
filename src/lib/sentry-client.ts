import * as Sentry from "@sentry/nextjs";
import { scrubEvent, IGNORE_ERRORS } from "./sentry-shared";

/**
 * Browser-side Sentry init. Gated on NEXT_PUBLIC_SENTRY_DSN — without it this is
 * a no-op. Idempotent: safe to call from both `instrumentation-client.ts`
 * (Next 15.3+) and the <Observability> provider (which is what actually runs on
 * the pinned Next 15.1 build), since only one real init happens.
 */
let started = false;

export function initSentryClient() {
  if (started || typeof window === "undefined") return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  // If something already created a client, don't double-init.
  if (Sentry.getClient()) {
    started = true;
    return;
  }
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Session replay off by default; capture a replay only when an error fires.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    ignoreErrors: IGNORE_ERRORS,
    beforeSend: scrubEvent,
  });
  started = true;
}
