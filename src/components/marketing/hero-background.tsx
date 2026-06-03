"use client";

import * as React from "react";

/**
 * Striking animated hero backdrop (§6.1.2) — indigo→cyan aurora + a slowly
 * rotating gradient-mesh, faint grid, light streaks and a fine grain overlay.
 *
 * - GPU-light: only transform/opacity animate (blurred radial gradients), no images.
 * - Lazy: loaded via next/dynamic({ ssr: false }) from <Hero>, so it never blocks
 *   the LCP headline. A static gradient base is painted by <Hero> underneath.
 * - Respects prefers-reduced-motion: we only mount the animated layers when the
 *   user hasn't asked to reduce motion (the global CSS also freezes animations).
 */
export function HeroBackground() {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // keep the static fallback from <Hero>
    // Defer to idle so first paint / LCP is never delayed by the effect.
    const start = () => setAnimate(true);
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const id = ric ? ric(start) : window.setTimeout(start, 200);
    return () => {
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback;
      if (ric && cic) cic(id);
      else window.clearTimeout(id);
    };
  }, []);

  if (!animate) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Rotating gradient-mesh — premium "alive" shimmer, very low opacity */}
      <div
        className="animate-mesh-spin absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.5] blur-2xl will-change-transform"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(109,94,246,0.16) 70deg, transparent 150deg, rgba(34,211,238,0.14) 230deg, transparent 320deg)",
        }}
      />

      {/* Aurora blobs — indigo / indigo-light / cyan, each drifting on its own path */}
      <div className="animate-drift-a absolute -left-[12%] top-[-22%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(109,94,246,0.40),transparent_62%)] blur-3xl will-change-transform" />
      <div className="animate-drift-b absolute right-[-8%] top-[6%] h-[52vh] w-[52vh] rounded-full bg-[radial-gradient(circle,rgba(139,125,255,0.30),transparent_62%)] blur-3xl will-change-transform" />
      <div className="animate-drift-c absolute bottom-[-20%] left-[24%] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.26),transparent_62%)] blur-3xl will-change-transform" />
      <div className="animate-aurora absolute bottom-[-10%] right-[18%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(109,94,246,0.22),transparent_62%)] blur-3xl will-change-transform [animation-delay:-9s]" />

      {/* Thin light streaks drifting across — adds depth without weight */}
      <div className="animate-drift-b absolute left-[8%] top-[34%] h-px w-[42%] rotate-[-12deg] bg-gradient-to-r from-transparent via-brand/40 to-transparent will-change-transform" />
      <div className="animate-drift-c absolute right-[6%] top-[58%] h-px w-[36%] rotate-[8deg] bg-gradient-to-r from-transparent via-accent/35 to-transparent will-change-transform [animation-delay:-7s]" />

      {/* Fine grain overlay for that premium texture (static, GPU-cheap) */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
