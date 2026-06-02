import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared admin building blocks. */

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-bg-elevated p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">{label}</span>
        <span className="grid size-9 place-items-center rounded-[10px] bg-brand/12 text-brand">
          <Icon className="size-4.5" />
        </span>
      </div>
      <span className="font-display text-3xl font-bold text-fg">{value}</span>
      {hint && <span className="text-xs text-fg-faint">{hint}</span>}
    </div>
  );
}

export function AdminCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[16px] border border-border bg-bg-elevated", className)}
      {...props}
    />
  );
}

export function PageActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-border py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-bg-subtle text-fg-faint">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-semibold text-fg">{title}</p>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-success/12 text-success border-success/30",
    DRAFT: "bg-bg-subtle text-fg-muted border-border",
    ARCHIVED: "bg-bg-subtle text-fg-faint border-border",
    new: "bg-brand/12 text-brand-glow border-brand/30",
    contacted: "bg-[#f5a623]/12 text-[#f5a623] border-[#f5a623]/30",
    closed: "bg-success/12 text-success border-success/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "bg-bg-subtle text-fg-muted border-border",
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
