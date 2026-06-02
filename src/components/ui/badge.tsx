import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-bg-subtle text-fg-muted border border-border px-2.5 py-1",
        brand: "bg-brand/12 text-brand-glow border border-brand/30 px-2.5 py-1",
        live: "bg-[#ff3b3b]/12 text-[#ff6b6b] border border-[#ff3b3b]/30 px-2.5 py-1 font-semibold uppercase tracking-wide",
        discount:
          "bg-success/12 text-success border border-success/30 px-2.5 py-1 font-semibold",
        outline: "border border-border-strong text-fg-muted px-2.5 py-1",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/** Pulsing "LIVE" badge (§5.5). */
export function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge variant="live" className={className}>
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75 motion-reduce:hidden" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[#ff3b3b]" />
      </span>
      Live
    </Badge>
  );
}
