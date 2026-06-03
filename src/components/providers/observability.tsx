"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { initPostHog, trackPageview } from "@/lib/analytics";

/**
 * Client-side analytics + error tracking. Both stay disabled unless their
 * public env vars are present (NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_SENTRY_DSN).
 * Wrapped in Suspense by the caller because it reads search params.
 */
export function Observability() {
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    initPostHog();
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        environment: process.env.NODE_ENV,
      });
    }
  }, []);

  React.useEffect(() => {
    const qs = search?.toString();
    trackPageview(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, search]);

  return null;
}
