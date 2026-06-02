import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Defense in depth — middleware already gates /admin, this re-checks server-side.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return <AdminShell user={user}>{children}</AdminShell>;
}
