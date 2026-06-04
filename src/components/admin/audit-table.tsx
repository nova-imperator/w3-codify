"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminCard, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Log = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: unknown;
  actor: string;
  createdAt: string;
};

const ACTION_STYLES: Record<string, string> = {
  create: "bg-success/15 text-success",
  promote: "bg-success/15 text-success",
  update: "bg-brand/15 text-brand-glow",
  status: "bg-brand/15 text-brand-glow",
  reorder: "bg-bg-subtle text-fg-muted",
  delete: "bg-[#fb7185]/15 text-[#fb7185]",
  revoke: "bg-[#fb7185]/15 text-[#fb7185]",
};

export function AuditTable({
  logs,
  total,
  page,
  pageCount,
  actions,
  entities,
  action,
  entity,
}: {
  logs: Log[];
  total: number;
  page: number;
  pageCount: number;
  actions: string[];
  entities: string[];
  action: string;
  entity: string;
}) {
  const router = useRouter();

  function go(next: { action?: string; entity?: string; page?: number }) {
    const p = new URLSearchParams();
    const a = next.action ?? action;
    const e = next.entity ?? entity;
    const pg = next.page ?? 1;
    if (a) p.set("action", a);
    if (e) p.set("entity", e);
    if (pg > 1) p.set("page", String(pg));
    router.push(`/admin/audit${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-fg-muted">
          {total} action{total === 1 ? "" : "s"} logged
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select label="Action" value={action} options={actions} onChange={(v) => go({ action: v, page: 1 })} />
          <Select label="Entity" value={entity} options={entities} onChange={(v) => go({ entity: v, page: 1 })} />
          {(action || entity) && (
            <button onClick={() => router.push("/admin/audit")} className="text-sm text-fg-muted hover:text-fg">
              Clear
            </button>
          )}
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No admin actions yet" description="Every create, update and delete in the admin panel is recorded here." />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-faint">
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Entity</th>
                  <th className="px-5 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((l) => (
                  <tr key={l.id} className="align-top hover:bg-bg-subtle/40">
                    <td className="whitespace-nowrap px-5 py-3.5 text-fg-muted">{fmtTime(l.createdAt)}</td>
                    <td className="px-5 py-3.5 font-medium text-fg">{l.actor}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", ACTION_STYLES[l.action] ?? "bg-bg-subtle text-fg-muted")}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">
                      {l.entity}
                      {l.entityId && <span className="ml-1 font-mono text-xs text-fg-faint">{l.entityId.slice(-6)}</span>}
                    </td>
                    <td className="max-w-[280px] px-5 py-3.5">
                      {l.meta ? (
                        <code className="block truncate font-mono text-xs text-fg-faint" title={JSON.stringify(l.meta)}>
                          {JSON.stringify(l.meta)}
                        </code>
                      ) : (
                        <span className="text-fg-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => go({ page: page - 1 })}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <span className="text-sm text-fg-faint">Page {page} of {pageCount}</span>
          <button
            disabled={page >= pageCount}
            onClick={() => go({ page: page + 1 })}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg disabled:opacity-40"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-[10px] border border-border bg-bg-subtle px-3 text-sm text-fg outline-none focus:border-brand/50"
    >
      <option value="">{label}: all</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
