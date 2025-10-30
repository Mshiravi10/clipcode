import { prisma } from './prisma';

export async function logAudit(
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    meta?: Record<string, unknown>
) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                meta: meta ? JSON.stringify(meta) : undefined,
            },
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
}


