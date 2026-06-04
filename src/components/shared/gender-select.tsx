"use client";

import { cn } from "@/lib/utils";
import type { Gender } from "@/lib/avatar";

const OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "UNSPECIFIED", label: "Prefer not to say" },
];

/**
 * On-brand segmented control for choosing gender. Used in first-login onboarding
 * and Profile → Basic Info. Keyboard + screen-reader friendly (radiogroup).
 */
export function GenderSelect({
  value,
  onChange,
  disabled,
}: {
  value: Gender;
  onChange: (g: Gender) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Gender" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[12px] border px-3 py-2.5 text-center text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 sm:text-sm",
              active
                ? "border-brand/60 bg-brand/12 text-brand-glow"
                : "border-border bg-bg-subtle text-fg-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
