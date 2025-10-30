import { requireAdmin } from '@/lib/auth-helpers';
import { logError } from '@/lib/error-logger';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await requireAdmin();

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

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            cutoffDate: cutoffDate.toISOString(),
        });
    } catch (error) {
        console.error('Failed to cleanup logs:', error);
        return NextResponse.json({ error: 'Failed to cleanup logs' }, { status: 500 });
    }
}

