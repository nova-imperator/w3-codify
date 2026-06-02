"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { AuroraBackground } from "./aurora-background";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AVATARS = ["A", "S", "R", "P", "K"];

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
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pb-16 pt-28 md:pt-32"
    >
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <AuroraBackground />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-page relative z-10 flex flex-col items-center text-center"
      >
        <motion.div variants={item}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-glow">
            <Sparkles className="size-3.5" />
            Learn. Build. Get Placed.
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 max-w-4xl text-[length:var(--text-display-lg)] font-semibold leading-[1.02]"
        >
          Become the software engineer that{" "}
          <BoxedWord>companies</BoxedWord> want to hire.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-balance text-base text-fg-muted md:text-lg"
        >
          Live cohorts, real projects, and an always-on AI mentor that explains
          code, fixes your errors, and answers your doubts — 24/7.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Magnetic strength={0.4}>
            <Button asChild size="lg" className="group">
              <Link href="/auth/signup">
                Start Journey
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Magnetic>
          <WatchDemo />
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 flex items-center gap-4"
        >
          <div className="flex -space-x-3">
            {AVATARS.map((a, i) => (
              <span
                key={a}
                className="grid size-9 place-items-center rounded-full border-2 border-bg bg-bg-subtle text-xs font-semibold text-fg"
                style={{ zIndex: AVATARS.length - i }}
              >
                {a}
              </span>
            ))}
          </div>
          <p className="text-left text-sm text-fg-muted">
            <span className="font-semibold text-fg">1M+ students</span> learning
            in our mastery programs
          </p>
        </motion.div>
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

/** The boxed/outlined brand accent word with an animated draw-on border (§6.1.2). */
function BoxedWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-2 text-brand">
      {children}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.rect
          x="1.5"
          y="6"
          width="97"
          height="88"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeInOut" }}
        />
      </motion.svg>
    </span>
  );
}

function WatchDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="group">
          <span className="grid size-6 place-items-center rounded-full bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <Play className="size-3 fill-current" />
          </span>
          Watch Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-border-strong p-0">
        <DialogTitle className="sr-only">W3Codify demo video</DialogTitle>
        <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-black">
          <div className="absolute inset-0 grid place-items-center bg-bg-elevated">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-white/10 backdrop-blur">
                <Play className="size-7 fill-white text-white" />
              </span>
              <p className="text-sm text-fg-muted">
                Demo reel coming soon — Mux-powered player lands in the
                classroom milestone.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
