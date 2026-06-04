"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, trackPageview } from "@/lib/analytics";
import { initSentryClient } from "@/lib/sentry-client";

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
    initSentryClient();
  }, []);

  React.useEffect(() => {
    const qs = search?.toString();
    trackPageview(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, search]);

  return null;
}
