import Link from "next/link";
import { Users, GraduationCap, BookOpen, PhoneCall, IndianRupee, TrendingUp } from "lucide-react";
import { getAdminStats } from "@/server/admin/queries";
import { StatCard, AdminCard, StatusPill } from "@/components/admin/ui";
import { EnrollmentChart } from "@/components/admin/enrollment-chart";
import { formatINR, formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={formatCompact(s.students)} icon={GraduationCap} />
        <StatCard label="Enrollments" value={formatCompact(s.enrollments)} icon={Users} />
        <StatCard
          label="Revenue"
          value={formatINR(s.revenue)}
          icon={IndianRupee}
          hint="From paid enrollments"
        />
        <StatCard label="New leads" value={String(s.leads)} icon={PhoneCall} hint="Awaiting contact" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AdminCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-fg">Enrollments</h2>
              <p className="text-sm text-fg-muted">Last 6 months</p>
            </div>
            <TrendingUp className="size-5 text-brand" />
          </div>
          <EnrollmentChart data={s.months} />
        </AdminCard>

        <AdminCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fg">Catalog</h2>
            <BookOpen className="size-5 text-brand" />
          </div>
          <dl className="flex flex-col gap-3">
            <Row label="Total courses" value={String(s.courses)} />
            <Row label="Published" value={String(s.publishedCourses)} />
            <Row label="Drafts" value={String(s.courses - s.publishedCourses)} />
          </dl>
          <Link
            href="/admin/courses"
            className="mt-5 inline-flex text-sm font-semibold text-brand hover:underline"
          >
            Manage courses →
          </Link>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-fg">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-brand hover:underline">
            View all →
          </Link>
        </div>
        {s.recentLeads.length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-faint">No leads yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {s.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{lead.name}</p>
                  <p className="truncate text-xs text-fg-muted">
                    +91 {lead.phone} · {lead.enquiryFor}
                  </p>
                </div>
                <StatusPill status={lead.status} />
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="font-semibold text-fg">{value}</dd>
    </div>
  );
}
