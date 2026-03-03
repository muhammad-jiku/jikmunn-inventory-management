import { Prisma } from '@prisma/client';

import prisma from './prisma';

export interface AuditEntry {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an audit trail entry for a CRUD operation.
 * Fire-and-forget — errors are silently caught so they never break the main flow.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        changes: (entry.changes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        ipAddress: entry.ipAddress,
        ...(entry.userId ? { userId: entry.userId } : {}),
      },
    });
  } catch (_error) {
    // Audit logging should never break the main request
  }
}
