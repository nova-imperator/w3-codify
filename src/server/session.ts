import { auth } from "@/lib/auth";

/** Current session user (or null) — for server components/actions. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
