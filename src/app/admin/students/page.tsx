import { getAdminStudents } from "@/server/admin/queries";
import { StudentsTable } from "@/components/admin/students-table";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const rows = await getAdminStudents();
  const students = rows.map((u) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(" "),
    email: u.email,
    phone: u.phone,
    enrollments: u._count.enrollments,
    courses: u.enrollments.map((e) => e.course.title),
    joined: u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  }));
  return <StudentsTable students={students} />;
}
