"use client";

import * as React from "react";
import { Search, GraduationCap } from "lucide-react";
import { AdminCard, EmptyState } from "@/components/admin/ui";

type Student = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  enrollments: number;
  courses: string[];
  joined: string;
};

export function StudentsTable({ students }: { students: Student[] }) {
  const [q, setQ] = React.useState("");
  const filtered = students.filter((s) => {
    if (!q) return true;
    const hay = `${s.name} ${s.email ?? ""} ${s.phone}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 rounded-[12px] border border-border bg-bg-subtle px-3.5 sm:max-w-sm">
        <Search className="size-4 text-fg-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone…"
          className="h-11 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
        />
      </div>

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students yet" description="Students appear here once people sign up and enroll." />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-faint">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Enrollments</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-subtle/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-fg">{s.name || "—"}</p>
                      <p className="truncate text-xs text-fg-faint">{s.courses.join(", ") || "No courses"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">
                      <p>+91 {s.phone}</p>
                      {s.email && <p className="truncate text-xs text-fg-faint">{s.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">{s.enrollments}</td>
                    <td className="px-5 py-3.5 text-fg-muted">{s.joined}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-fg-faint">
                      No students match “{q}”.
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
