import * as Sentry from "@sentry/nextjs";

/**
 * Server/edge error tracking (BUILD_SPEC §13). Sentry stays fully disabled
 * unless SENTRY_DSN is set — so it's a no-op now and activates automatically
 * the moment a DSN is added to the environment.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: true,
    environment: process.env.NODE_ENV,
  });
}

// Next.js calls this for uncaught errors in server components / route handlers.
export const onRequestError = Sentry.captureRequestError;
