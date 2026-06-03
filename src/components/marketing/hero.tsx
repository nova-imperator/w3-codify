"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

// The animated layer is lazy + client-only so it never blocks the LCP headline.
// The static base below is server-rendered and is also the reduced-motion fallback.
const HeroBackground = dynamic(
  () => import("./hero-background").then((m) => m.HeroBackground),
  { ssr: false },
);

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pb-20 pt-28 md:pt-36"
    >
      {/* Background — slow parallax drift on scroll */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        {/* Static base (SSR): on-brand wash + grid + vignette. Always painted. */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(109,94,246,0.20),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_85%_20%,rgba(34,211,238,0.12),transparent_60%)]" />
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_28%,transparent_72%)]" />
        </div>
        {/* Animated richness (lazy, client-only, reduced-motion aware) */}
        <HeroBackground />
        {/* Vignette keeps the headline crisp over everything */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,var(--bg)_92%)]"
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-page relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={item}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brand-glow sm:text-xs">
            <Sparkles className="size-3.5" />
            Learn. Build. Get Placed.
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mx-auto mt-7 max-w-4xl text-balance text-[length:var(--text-display-lg)] font-semibold leading-[1.05] tracking-[-0.02em]"
        >
          Become the software engineer that{" "}
          <AccentWord>companies</AccentWord> want to hire.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-balance text-base text-fg-muted md:text-lg"
        >
          Live cohorts, real projects, and an always-on AI mentor that explains
          code, fixes your errors, and answers your doubts — 24/7.
        </motion.p>

        <motion.p
          variants={item}
          className="mt-8 text-sm text-fg-muted sm:text-base"
        >
          <span className="font-semibold text-fg">1M+ students</span> learning in
          our mastery programs
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 motion-reduce:hidden"
      >
        <div className="flex h-9 w-5.5 items-start justify-center rounded-full border border-border-strong p-1">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-brand"
          />
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Hero accent word (§6.1.2) — the word rendered in the indigo→cyan gradient
 * with a clean gradient underline that draws on. Pure inline treatment (no box),
 * so it never breaks and stays crisp at 360 / 768 / 1440px.
 */
function AccentWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="text-gradient">{children}</span>
      <motion.span
        aria-hidden
        className="bg-accent-grad absolute -bottom-[0.06em] left-0 h-[0.09em] w-full origin-left rounded-full"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}
