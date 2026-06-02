import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Edge-safe auth config — no Prisma, no provider logic. Used by middleware
 * for route protection and shared by the full config in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      const su = session.user as { id?: string; role?: Role };
      su.id = token.id as string | undefined;
      su.role = token.role as Role | undefined;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;
      const isLoggedIn = !!auth?.user;

      if (pathname.startsWith("/admin")) {
        if (role === "ADMIN") return true;
        // Logged-in non-admin -> home; anonymous -> sign in (with callback).
        if (isLoggedIn) return NextResponse.redirect(new URL("/", request.nextUrl));
        return false;
      }
      if (pathname.startsWith("/profile") || pathname.startsWith("/classroom")) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
