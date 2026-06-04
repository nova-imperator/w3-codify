"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, GraduationCap, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { AdminCard, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { setUserRole } from "@/server/admin/actions";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type Student = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: Role;
  enrollments: number;
  courses: string[];
  joined: string;
};

export function StudentsTable({
  students,
  currentUserId,
}: {
  students: Student[];
  currentUserId: string;
}) {
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState(students);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => setRows(students), [students]);

  const filtered = rows.filter((s) => {
    if (!q) return true;
    const hay = `${s.name} ${s.email ?? ""} ${s.phone} ${s.role}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  async function toggleAdmin(s: Student) {
    const makeAdmin = s.role !== "ADMIN";
    if (!makeAdmin && !confirm(`Revoke admin access for ${s.name}?`)) return;
    setBusyId(s.id);
    const res = await setUserRole(s.id, makeAdmin);
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    setRows((prev) => prev.map((r) => (r.id === s.id ? { ...r, role: makeAdmin ? "ADMIN" : "STUDENT" } : r)));
    toast.success(makeAdmin ? `${s.name} is now an admin` : `Admin access revoked for ${s.name}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 rounded-[12px] border border-border bg-bg-subtle px-3.5 sm:max-w-sm">
        <Search className="size-4 text-fg-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone, role…"
          className="h-11 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No users yet" description="Users appear here once people sign in and enroll." />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-faint">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Enrollments</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const isAdmin = s.role === "ADMIN";
                  const isSelf = s.id === currentUserId;
                  return (
                    <tr key={s.id} className="hover:bg-bg-subtle/40">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-fg">{s.name || "—"}</p>
                        <p className="truncate text-xs text-fg-faint">{s.courses.join(", ") || "No courses"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-fg-muted">
                        {s.email && <p className="truncate">{s.email}</p>}
                        {s.phone && <p className="text-xs text-fg-faint">+91 {s.phone}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            isAdmin ? "bg-brand/15 text-brand-glow" : "bg-bg-subtle text-fg-muted",
                          )}
                        >
                          {isAdmin && <ShieldCheck className="size-3" />}
                          {s.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-fg-muted">{s.enrollments}</td>
                      <td className="px-5 py-3.5 text-fg-muted">{s.joined}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant={isAdmin ? "ghost" : "secondary"}
                          size="sm"
                          disabled={busyId === s.id || (isAdmin && isSelf)}
                          title={isAdmin && isSelf ? "You can't revoke your own admin access" : undefined}
                          onClick={() => toggleAdmin(s)}
                        >
                          {busyId === s.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : isAdmin ? (
                            <ShieldOff className="size-4" />
                          ) : (
                            <ShieldCheck className="size-4" />
                          )}
                          {isAdmin ? "Revoke admin" : "Make admin"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-fg-faint">
                      No users match “{q}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
