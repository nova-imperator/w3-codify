import type { NextAuthConfig } from "next-auth";
import type { Gender, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getClientIp, isIpAllowed } from "@/lib/ip";

/** Admin session is stale once older than ADMIN_SESSION_MAX_MIN (default 60). */
function adminSessionStale(loginAt?: number): boolean {
  const maxMin = Number(process.env.ADMIN_SESSION_MAX_MIN ?? 60);
  if (!Number.isFinite(maxMin) || maxMin <= 0 || !loginAt) return false;
  return Date.now() - loginAt > maxMin * 60_000;
}

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
        const u = user as {
          role?: Role; gender?: Gender; avatarUrl?: string | null;
          firstName?: string | null; lastName?: string | null; name?: string | null;
        };
        token.id = user.id;
        token.role = u.role;
        token.gender = u.gender ?? "UNSPECIFIED";
        token.avatarUrl = u.avatarUrl ?? null;
        // Display name from firstName/lastName so the navbar shows the real name, not "Learner".
        const composed = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
        token.name = composed || u.name || token.name || null;
        token.loginAt = Date.now(); // for admin session-age hardening (§11)
      }
      // Optimistic client patches (profile/onboarding) call `update({ gender, avatarUrl, name })`
      // so the navbar avatar + name refresh without a re-login or extra query.
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { gender?: Gender; avatarUrl?: string | null; name?: string | null };
        if (s.gender !== undefined) token.gender = s.gender;
        if (s.avatarUrl !== undefined) token.avatarUrl = s.avatarUrl;
        if (s.name !== undefined) token.name = s.name || null;
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
      (su as { loginAt?: number }).loginAt = token.loginAt as number | undefined;
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

      const isAdminPage = pathname.startsWith("/admin");
      const isAdminApi = pathname.startsWith("/api/admin");

      if (isAdminPage || isAdminApi) {
        // 1) Optional IP allowlist (opt-in). Unset → no restriction. Applies to
        //    everyone, before auth, so blocked IPs never even reach sign-in.
        const allowlist = process.env.ADMIN_IP_ALLOWLIST?.trim();
        if (allowlist && !isIpAllowed(getClientIp(request.headers), allowlist)) {
          return new NextResponse("Forbidden", { status: 403 });
        }

        const loginAt = (auth?.user as { loginAt?: number } | undefined)?.loginAt;

        // 2) API: status codes (no redirects).
        if (isAdminApi) {
          if (role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
          if (adminSessionStale(loginAt)) return new NextResponse("Session expired", { status: 401 });
          return true;
        }

        // 3) Pages.
        if (role === "ADMIN") {
          if (adminSessionStale(loginAt)) {
            const url = new URL("/auth/signin", request.nextUrl);
            url.searchParams.set("callbackUrl", pathname);
            url.searchParams.set("reauth", "1");
            return NextResponse.redirect(url);
          }
          return true;
        }
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
