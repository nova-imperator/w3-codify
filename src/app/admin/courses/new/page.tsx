import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/server/session";
import { CourseForm } from "@/components/admin/course-form";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  await requireAdmin();
  const instructors = await prisma.instructor.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Back to courses
      </Link>
      <p className="text-sm text-fg-muted">
        Create the course details first — then add the curriculum and content.
      </p>
      <CourseForm instructors={instructors} />
    </div>
  );
}
