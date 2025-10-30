import { cleanupExpiredSessions } from '@/lib/cron/cleanup-logs';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const result = await cleanupExpiredSessions();

        return NextResponse.json({
            success: true,
            retrievableData: {
                deletedCount: result.deletedCount,
                cleanupDate: result.cleanupDate,
            },
        });
    } catch (error) {
        console.error('Failed to cleanup expired sessions:', error);
        return NextResponse.json({ error: 'Failed to cleanup expired sessions' }, { status: 500 });
    }
}

