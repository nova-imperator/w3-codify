"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** 6-box OTP input with auto-advance, paste, and backspace handling. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  function setAt(i: number, d: string) {
    const next = value.split("");
    next[i] = d;
    const joined = next.join("").replace(/\s/g, "").slice(0, 6);
    onChange(joined);
    if (joined.length === 6) onComplete?.(joined);
  }

  function handleChange(i: number, raw: string) {
    const d = raw.replace(/\D/g, "");
    if (!d) return;
    if (d.length > 1) {
      // paste
      const chars = d.slice(0, 6).split("");
      onChange(chars.join(""));
      const last = Math.min(chars.length, 6) - 1;
      refs.current[last]?.focus();
      if (chars.length >= 6) onComplete?.(chars.join("").slice(0, 6));
      return;
    }
    setAt(i, d);
    if (i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (value[i]) {
        setAt(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time code">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-13 w-full rounded-[12px] border bg-bg-subtle text-center font-display text-xl font-semibold text-fg transition-colors",
            "border-border focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-ring/40",
            "disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
