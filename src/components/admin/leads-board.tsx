"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Phone, MessageSquare } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import { updateLeadStatus } from "@/server/admin/actions";

type Lead = {
  id: string;
  name: string;
  phone: string;
  enquiryFor: string;
  message: string | null;
  status: string;
  createdAt: string;
};

const COLUMNS = [
  { key: "new", label: "New", accent: "border-brand/40" },
  { key: "contacted", label: "Contacted", accent: "border-[#f5a623]/40" },
  { key: "closed", label: "Closed", accent: "border-success/40" },
];
const ORDER = ["new", "contacted", "closed"];

export function LeadsBoard({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(leads);

  function move(id: string, dir: -1 | 1) {
    setItems((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = ORDER.indexOf(l.status);
        const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, idx + dir))];
        return { ...l, status: next };
      }),
    );
    const lead = items.find((l) => l.id === id);
    if (!lead) return;
    const idx = ORDER.indexOf(lead.status);
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, idx + dir))];
    updateLeadStatus(id, next).then((res) => {
      if (res.ok) router.refresh();
      else toast.error(res.error);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const colLeads = items.filter((l) => l.status === col.key);
        return (
          <div key={col.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold text-fg">{col.label}</h2>
              <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted">
                {colLeads.length}
              </span>
            </div>
            <div className="flex min-h-24 flex-col gap-3 rounded-[14px] border border-dashed border-border bg-bg-elevated/30 p-3">
              {colLeads.length === 0 && (
                <p className="py-6 text-center text-xs text-fg-faint">No leads</p>
              )}
              {colLeads.map((lead) => {
                const idx = ORDER.indexOf(lead.status);
                return (
                  <AdminCard key={lead.id} className={`border-l-2 p-4 ${col.accent}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fg">{lead.name}</p>
                        <p className="flex items-center gap-1 text-xs text-fg-muted">
                          <Phone className="size-3" /> +91 {lead.phone}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-fg-faint">{lead.createdAt}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-fg-faint">{lead.enquiryFor}</p>
                    {lead.message && (
                      <p className="mt-2 flex gap-1.5 rounded-[8px] bg-bg-subtle p-2 text-xs text-fg-muted">
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="line-clamp-3">{lead.message}</span>
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => move(lead.id, -1)}
                        disabled={idx === 0}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-bg-subtle hover:text-fg disabled:opacity-30"
                      >
                        <ArrowLeft className="size-3" /> Back
                      </button>
                      <button
                        onClick={() => move(lead.id, 1)}
                        disabled={idx === ORDER.length - 1}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10 disabled:opacity-30"
                      >
                        {idx === 0 ? "Mark contacted" : "Close"} <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
