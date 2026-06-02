import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { verifyOtp } from "@/server/otp";
import { normalizePhone, isValidPhone } from "@/lib/otp";

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: { phone: {}, code: {} },
      async authorize(credentials) {
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        const code = String(credentials?.code ?? "").trim();
        if (!isValidPhone(phone) || code.length !== 6) return null;

        const result = await verifyOtp(phone, code);
        if (!result.ok) return null;

        // Phone-OTP signs in existing users only (register creates the user first).
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return null;

        if (!user.phoneVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true },
          });
        }
        return {
          id: user.id,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          email: user.email ?? undefined,
          role: user.role,
        };
      },
    }),
    ...(googleConfigured ? [Google] : []),
  ],
});
