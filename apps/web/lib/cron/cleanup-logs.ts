import { logError } from '../error-logger';
import { prisma } from '../prisma';

export async function cleanupLogs() {
    try {
        const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '30');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await prisma.errorLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });

        await logError('Log cleanup completed', undefined, { deletedCount: result.count }, 'info');

        return {
            success: true,
            deletedCount: result.count,
            cutoffDate,
        };
    } catch (error) {
        console.error('Log cleanup failed:', error);
        throw error;
    }
}

export async function cleanupExpiredSessions() {
    try {
        const now = new Date();

        const result = await prisma.session.deleteMany({
            where: {
                expires: {
                    lt: now,
                },
            },
        });

        await logError('Expired sessions cleanup completed', undefined, { deletedCount: result.count }, 'info');

        return {
            success: true,
            deletedCount: result.count,
            cleanupDate: now,
        };
    } catch (error) {
        console.error('Session cleanup failed:', error);
        throw error;
    }
}

