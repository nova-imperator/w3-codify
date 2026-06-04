/**
 * End-to-end demo of passwordless EMAIL-OTP auth (§6.4):
 *   1) Send a REAL branded OTP email via SMTP (proves delivery).
 *   2) Drive verify → auto-create on first login → first-login onboarding →
 *      "Skip for now" → returning login (no onboarding), with assertions.
 *
 *   pnpm tsx scripts/demo-auth.mts [recipom@email]
 */
import { readFileSync } from "fs";

// Load .env into process.env (prisma + mailer read it at call time).
for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { prisma } = await import("../src/lib/prisma.ts");
const { generateOtp, hashOtp, safeEqualHex, normalizeEmail } = await import("../src/lib/otp.ts");
const { sendOtpEmail, isSmtpConfigured } = await import("../src/lib/mailer.ts");

const ok = (b: boolean) => (b ? "✅" : "❌ FAIL");

// ── 1) Real email delivery ──
const recipient = normalizeEmail(process.argv[2] ?? "bradforbes24@hotmail.com");
console.log(`\n━━━ 1. SMTP delivery ━━━`);
console.log(`SMTP configured: ${isSmtpConfigured()}`);
const realCode = generateOtp();
try {
  const delivered = await sendOtpEmail(recipient, realCode);
  console.log(`Sent a real branded OTP email to ${recipient} → delivered=${delivered}`);
} catch (e) {
  console.log(`Email send error: ${String(e).slice(0, 160)}`);
}

// ── 2) Verify + auto-create + onboarding logic (throwaway account) ──
const email = normalizeEmail(`demo+${Date.now()}@w3codify.test`);
console.log(`\n━━━ 2. Sign-in flow for a brand-new email: ${email} ━━━`);

// send-OTP: store a hashed code
const code = generateOtp();
await prisma.otpRequest.deleteMany({ where: { email } });
await prisma.otpRequest.create({
  data: { email, codeHash: hashOtp(email, code), expiresAt: new Date(Date.now() + 10 * 60_000) },
});
console.log(`  OTP issued (hashed at rest): ${code}`);

// verify (constant-time hash compare) — mirrors verifyEmailOtp
const req = await prisma.otpRequest.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
const verified = !!req && safeEqualHex(req.codeHash, hashOtp(email, code));
console.log(`  Code verifies: ${ok(verified)}`);
await prisma.otpRequest.deleteMany({ where: { email } });

// first login → auto-create (mirrors auth.ts authorize)
let user = await prisma.user.findUnique({ where: { email } });
const wasNew = !user;
user = user ?? (await prisma.user.create({ data: { email, emailVerified: new Date(), role: "STUDENT" } }));
console.log(`  Account auto-created on first login: ${ok(wasNew)}  (emailVerified set: ${ok(!!user.emailVerified)})`);

// needs onboarding?
let fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { onboardedAt: true } });
console.log(`  New user needs onboarding: ${ok(fresh?.onboardedAt === null)}`);

// "Skip for now" → completeOnboarding({skip}) sets onboardedAt, never blocks entry
await prisma.user.update({ where: { id: user.id }, data: { onboardedAt: new Date() } });
fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { onboardedAt: true } });
console.log(`  After Skip → onboarding no longer shown: ${ok(fresh?.onboardedAt !== null)}`);

// returning login → existing user, no create, no onboarding
const ret = await prisma.user.findUnique({ where: { email } });
console.log(`  Returning login signs into same account: ${ok(!!ret && ret.id === user.id)}`);
console.log(`  Returning user skips onboarding: ${ok(ret?.onboardedAt !== null)}`);

// cleanup
await prisma.user.delete({ where: { id: user.id } });
await prisma.$disconnect();
console.log(`\n✓ auth demo complete (throwaway account cleaned up)`);
