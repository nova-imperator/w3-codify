"use client";

import * as React from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
  motion,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/** Animated number counter that runs once when scrolled into view (§5.4). */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = usePrefersReducedMotion();
  const count = useMotionValue(0);

  const display = useTransform(count, (v) => {
    const n = Math.round(v);
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return `${prefix}${Number.isInteger(m) ? m : m.toFixed(1)}M${suffix}`;
    }
    if (n >= 1_000) return `${prefix}${Math.round(n / 1000)}k${suffix}`;
    return `${prefix}${n}${suffix}`;
  });

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, value, count]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
