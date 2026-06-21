import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE";

export async function writeAuditLog(params: {
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      changes: (params.changes ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
