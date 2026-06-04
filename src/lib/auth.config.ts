import type { NextAuthConfig } from "next-auth";
import type { Gender, Role } from "@prisma/client";
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
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { role?: Role; gender?: Gender; avatarUrl?: string | null };
        token.id = user.id;
        token.role = u.role;
        token.gender = u.gender ?? "UNSPECIFIED";
        token.avatarUrl = u.avatarUrl ?? null;
      }
      // Optimistic client patches (profile/onboarding) call `update({ gender, avatarUrl })`
      // so the navbar avatar refreshes without a re-login or extra query.
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { gender?: Gender; avatarUrl?: string | null };
        if (s.gender !== undefined) token.gender = s.gender;
        if (s.avatarUrl !== undefined) token.avatarUrl = s.avatarUrl;
      }
      return token;
    },
    session({ session, token }) {
      const su = session.user as {
        id?: string;
        role?: Role;
        gender?: Gender;
        avatarUrl?: string | null;
      };
      su.id = token.id as string | undefined;
      su.role = token.role as Role | undefined;
      su.gender = (token.gender as Gender | undefined) ?? "UNSPECIFIED";
      su.avatarUrl = (token.avatarUrl as string | null | undefined) ?? null;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;
      const isLoggedIn = !!auth?.user;

      // Bootcamp removed from the IA (§4) — exact 301 → /courses.
      if (pathname === "/bootcamp" || pathname.startsWith("/bootcamp/")) {
        return NextResponse.redirect(new URL("/courses", request.nextUrl), 301);
      }

      // Signup merged into Sign In (§6.5) — 301 → /auth/signin (keep callbackUrl).
      if (pathname === "/auth/signup" || pathname.startsWith("/auth/signup/")) {
        const url = new URL("/auth/signin", request.nextUrl);
        const cb = request.nextUrl.searchParams.get("callbackUrl");
        if (cb) url.searchParams.set("callbackUrl", cb);
        return NextResponse.redirect(url, 301);
      }

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
