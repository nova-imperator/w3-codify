"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { toggleFeatureFlag } from "@/server/admin/actions";

export type FlagRow = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string | null;
};

export function FeatureFlagsManager({ flags }: { flags: FlagRow[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  // Optimistic local view so the switch flips instantly.
  const [state, setState] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(flags.map((f) => [f.key, f.enabled])),
  );

  async function toggle(key: string) {
    if (pending) return;
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next }));
    setPending(key);
    const res = await toggleFeatureFlag(key, next);
    setPending(null);
    if (res.ok) {
      toast.success(`${labelFor(flags, key)} ${next ? "enabled" : "disabled"}`);
      router.refresh();
    } else {
      setState((s) => ({ ...s, [key]: !next })); // revert
      toast.error(res.error);
    }
  }

  return (
    <AdminCard className="divide-y divide-border">
      {flags.map((f) => {
        const on = state[f.key];
        const busy = pending === f.key;
        return (
          <div key={f.key} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-fg">{f.label}</p>
                <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-[11px] text-fg-faint">{f.key}</code>
              </div>
              <p className="mt-0.5 text-xs text-fg-muted">{f.description}</p>
              {f.updatedAt && (
                <p className="mt-1 text-[11px] text-fg-faint">
                  Updated {new Date(f.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={`Toggle ${f.label}`}
              disabled={busy}
              onClick={() => toggle(f.key)}
              className={cn(
                "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60",
                on ? "border-brand bg-brand" : "border-border bg-bg-subtle",
              )}
            >
              <span
                className={cn(
                  "grid size-4.5 place-items-center rounded-full bg-white shadow transition-transform",
                  on ? "translate-x-[22px]" : "translate-x-[3px]",
                )}
              >
                {busy && <Loader2 className="size-3 animate-spin text-fg-muted" />}
              </span>
            </button>
          </div>
        );
      })}
    </AdminCard>
  );
}

function labelFor(flags: FlagRow[], key: string) {
  return flags.find((f) => f.key === key)?.label ?? key;
}
