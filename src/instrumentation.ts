import * as Sentry from "@sentry/nextjs";
import { scrubEvent, IGNORE_ERRORS } from "@/lib/sentry-shared";

/**
 * Server + edge error tracking (BUILD_SPEC §13). Next.js calls register() once
 * per runtime (nodejs and edge), so this single init covers both. Sentry stays
 * fully disabled unless SENTRY_DSN is set — a no-op now, activating
 * automatically the moment a DSN is added (see docs/GO_LIVE.md).
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    enabled: true,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    ignoreErrors: IGNORE_ERRORS,
    beforeSend: scrubEvent,
  });
}

// Next.js calls this for uncaught errors in server components / route handlers.
export const onRequestError = Sentry.captureRequestError;
