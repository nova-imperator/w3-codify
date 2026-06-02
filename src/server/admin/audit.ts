import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Record an admin mutation in the audit log (BUILD_SPEC §6.9). */
export async function logAction(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  meta?: Prisma.InputJsonValue,
) {
  try {
    await prisma.adminAuditLog.create({
      data: { actorId, action, entity, entityId: entityId ?? null, meta },
    });
  } catch {
    // Audit logging must never break the actual mutation.
  }
}
