import Link from "next/link";
import { Plus, BookOpen, Users, Layers } from "lucide-react";
import { getAdminCourses } from "@/server/admin/queries";
import { AdminCard, EmptyState, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { formatINR, formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">
          {courses.length} {courses.length === 1 ? "course" : "courses"} in the catalog
        </p>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="size-4" /> New course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started.">
          <Button asChild className="mt-2">
            <Link href="/admin/courses/new">
              <Plus className="size-4" /> New course
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-faint">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Enrolled</th>
                  <th className="px-5 py-3 font-medium">Content</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-bg-subtle/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/courses/${c.id}`} className="font-medium text-fg hover:text-brand-glow">
                        {c.title}
                      </Link>
                      <p className="text-xs text-fg-faint">
                        {c.instructors.map((i) => i.name).join(", ") || "No instructor"}
                        {c.isLive && " · Live"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5"><StatusPill status={c.status} /></td>
                    <td className="px-5 py-3.5 text-fg-muted">
                      {c.priceInr === 0 ? "Free" : formatINR(c.priceInr)}
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" /> {formatCompact(c._count.enrollments)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="size-3.5" /> {c._count.sections} sections
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <CourseRowActions id={c.id} slug={c.slug} status={c.status} title={c.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
