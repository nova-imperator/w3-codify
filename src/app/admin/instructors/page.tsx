import { getAdminInstructors } from "@/server/admin/queries";
import { InstructorsManager } from "@/components/admin/instructors-manager";

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
  const rows = await getAdminInstructors();
  const instructors = rows.map((i) => ({
    id: i.id,
    name: i.name,
    role: i.role,
    bio: i.bio,
    photo: i.photo,
    courses: i._count.courses,
  }));
  return <InstructorsManager instructors={instructors} />;
}
