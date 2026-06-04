import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Shared Sentry config used by the server (`instrumentation.ts`), edge, and
 * client (`sentry-client.ts`). Keeps PII filtering + noise rules identical
 * everywhere. Sentry only initialises when a DSN is present, so all of this is
 * a no-op until it's activated (see docs/GO_LIVE.md).
 */

/** Common browser/network noise we never want to page on. */
export const IGNORE_ERRORS: (string | RegExp)[] = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications.",
  "Non-Error promise rejection captured",
  "AbortError",
  "The user aborted a request.",
  "Failed to fetch",
  "NetworkError when attempting to fetch resource.",
  "Load failed",
  // Browser extensions injecting scripts.
  /chrome-extension:\/\//,
  /moz-extension:\/\//,
];

/**
 * Strip PII and sensitive request data before an event leaves the app. We don't
 * enable `sendDefaultPii`, but headers/cookies can still carry secrets, so we
 * scrub them defensively.
 */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.cookies;
    const headers = event.request.headers;
    if (headers) {
      delete headers["cookie"];
      delete headers["Cookie"];
      delete headers["authorization"];
      delete headers["Authorization"];
    }
  }
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }
  return event;
}
