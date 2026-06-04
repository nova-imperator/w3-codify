/**
 * Promote a user to ADMIN by email or phone (bootstrap / break-glass).
 *
 *   pnpm tsx scripts/make-admin.ts <email-or-phone> [--revoke]
 *
 * Prisma auto-loads .env, so DATABASE_URL is picked up automatically.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(-10);
}

async function main() {
  const arg = process.argv[2];
  const revoke = process.argv.includes("--revoke");
  if (!arg) {
    console.error("Usage: pnpm tsx scripts/make-admin.ts <email-or-phone> [--revoke]");
    process.exit(1);
  }

  const where = arg.includes("@")
    ? { email: arg.trim().toLowerCase() }
    : { phone: normalizePhone(arg) };

  const user = await prisma.user.findUnique({ where });
  if (!user) {
    console.error(`✗ No user found for ${JSON.stringify(where)}.`);
    process.exit(1);
  }

  const role = revoke ? "STUDENT" : "ADMIN";
  const updated = await prisma.user.update({ where: { id: user.id }, data: { role } });
  console.log(
    `✓ ${updated.email ?? updated.phone} is now ${updated.role} (was ${user.role}).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
