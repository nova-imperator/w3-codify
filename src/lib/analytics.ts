import posthog from "posthog-js";

/**
 * Product analytics (BUILD_SPEC §13). PostHog only initializes when
 * NEXT_PUBLIC_POSTHOG_KEY is present; otherwise track()/initPostHog() are
 * no-ops, so funnel instrumentation is safe to call everywhere.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let inited = false;

export function analyticsEnabled() {
  return !!KEY;
}

export function initPostHog() {
  if (inited || !KEY || typeof window === "undefined") return;
  posthog.init(KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // we capture manually on route change
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });
  inited = true;
}

export function trackPageview(url: string) {
  if (!KEY) return;
  try {
    posthog.capture("$pageview", { $current_url: url });
  } catch {
    /* ignore */
  }
}

/** Track a funnel event (CTA, enroll, callback, signup…). */
export function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* ignore */
  }
}
