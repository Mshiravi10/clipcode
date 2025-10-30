import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const level = searchParams.get('level');
        const search = searchParams.get('search');
        const userId = searchParams.get('userId');

        const skip = (page - 1) * limit;

        const where: any = {};

        if (level) {
            where.level = level;
        }

        if (userId) {
            where.userId = userId;
        }

        if (search) {
            where.OR = [
                { message: { contains: search, mode: 'insensitive' } },
                { stackTrace: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [logs, total] = await Promise.all([
            prisma.errorLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.errorLog.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

