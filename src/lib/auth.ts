import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { verifyEmailOtp } from "@/server/otp";
import { normalizeEmail, isValidEmail } from "@/lib/otp";

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: { email: {}, code: {} },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const code = String(credentials?.code ?? "").trim();
        if (!isValidEmail(email) || code.length !== 6) return null;

        const result = await verifyEmailOtp(email, code);
        if (!result.ok) return null;

        // Passwordless: sign in if the email exists, else create the account.
        const existing = await prisma.user.findUnique({ where: { email } });
        const user =
          existing ??
          (await prisma.user.create({
            data: { email, emailVerified: new Date(), role: "STUDENT" },
          }));

        // Returning user verifying their email for the first time.
        if (existing && !existing.emailVerified) {
          await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        }

        return {
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...(googleConfigured ? [Google] : []),
  ],
  events: {
    // Google sign-up already carries a name + verified email → skip onboarding.
    async createUser({ user }) {
      await prisma.user
        .update({ where: { id: user.id }, data: { onboardedAt: new Date() } })
        .catch(() => {});
    },
  },
});
