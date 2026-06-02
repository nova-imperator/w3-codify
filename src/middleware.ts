import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge middleware (no Prisma) — protects /admin, /profile, /classroom.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/classroom/:path*"],
};
