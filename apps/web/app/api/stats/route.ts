import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [
            totalSnippets,
            favoriteCount,
            topLanguages,
            topTags,
            mostUsed,
            recentActivity,
        ] = await Promise.all([
            prisma.snippet.count({
                where: { ownerId: session.user.id },
            }),
            prisma.snippet.count({
                where: {
                    ownerId: session.user.id,
                    isFavorite: true,
                },
            }),
            prisma.snippet.groupBy({
                by: ['language'],
                where: { ownerId: session.user.id },
                _count: true,
                orderBy: {
                    _count: {
                        language: 'desc',
                    },
                },
                take: 5,
            }),
            prisma.snippetTag.groupBy({
                by: ['tagId'],
                _count: true,
                orderBy: {
                    _count: {
                        tagId: 'desc',
                    },
                },
                take: 5,
            }),
            prisma.snippet.findMany({
                where: { ownerId: session.user.id },
                orderBy: { usageCount: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    usageCount: true,
                    language: true,
                },
            }),
            prisma.auditLog.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    action: true,
                    entity: true,
                    entityId: true,
                    createdAt: true,
                },
            }),
        ]);

        const tagIds = topTags.map(t => t.tagId);
        const tags = await prisma.tag.findMany({
            where: { id: { in: tagIds } },
            select: { id: true, name: true, slug: true },
        });

        const topTagsWithNames = topTags.map(t => {
            const tag = tags.find(tag => tag.id === t.tagId);
            return {
                ...tag,
                count: t._count,
            };
        });

        return NextResponse.json({
            data: {
                totalSnippets,
                favoriteCount,
                topLanguages: topLanguages.map(l => ({
                    language: l.language,
                    count: l._count,
                })),
                topTags: topTagsWithNames,
                mostUsed,
                recentActivity,
            },
        });
    } catch (error) {
        console.error('GET /api/stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}


