"use client";

import { motion, type Variants } from "framer-motion";
import * as React from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

/**
 * Scroll-reveal: fade + 16–24px rise, triggered ~15% in view (§5.4).
 * Reduced-motion users get the content immediately (no transform).
 */
export function Reveal({
  children,
  className,
  delayIndex = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delayIndex?: number;
  as?: "div" | "li" | "section" | "span";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      custom={delayIndex}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </MotionTag>
  );
}

/** Staggered container — children using `Reveal` cascade in. */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: 0.08 }}
    >
      {children}
    </motion.div>
  );
}
