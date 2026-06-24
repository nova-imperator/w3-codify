"use client";

import * as React from "react";

type TurnstileOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "auto" | "light" | "dark";
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** True when a Turnstile site key is configured (inlined at build time). */
export const isTurnstileEnabled = () => !!SITE_KEY;

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Turnstile"));
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Renders a Cloudflare Turnstile widget and reports its token. Returns null when
 * no site key is set, so callers can render it unconditionally. Remount (via a
 * changing `key`) to obtain a fresh single-use token after each submission.
 */
export function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  className,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  const cbs = React.useRef({ onVerify, onExpire, onError });
  cbs.current = { onVerify, onExpire, onError };

  React.useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          callback: (t) => cbs.current.onVerify(t),
          "expired-callback": () => cbs.current.onExpire?.(),
          "error-callback": () => cbs.current.onError?.(),
        });
      })
      .catch(() => cbs.current.onError?.());
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget already gone */
        }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className={className ?? "flex min-h-[65px] justify-center"} />;
}
