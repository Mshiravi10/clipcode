import { logAudit } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const snippet = await prisma.snippet.findFirst({
            where: {
                id: params.id,
                ownerId: session.user.id,
            },
        });

        if (!snippet) {
            return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_snippetId: {
                    userId: session.user.id,
                    snippetId: params.id,
                },
            },
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id,
                },
            });

            await prisma.snippet.update({
                where: { id: params.id },
                data: { isFavorite: false },
            });

            await logAudit('UNFAVORITED_SNIPPET', 'SNIPPET', params.id, session.user.id);

            return NextResponse.json({ data: { isFavorite: false } });
        } else {
            await prisma.favorite.create({
                data: {
                    userId: session.user.id,
                    snippetId: params.id,
                },
            });

            await prisma.snippet.update({
                where: { id: params.id },
                data: { isFavorite: true },
            });

            await logAudit('FAVORITED_SNIPPET', 'SNIPPET', params.id, session.user.id);

            return NextResponse.json({ data: { isFavorite: true } });
        }
    } catch (error) {
        console.error('POST /api/favorite/[id] error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle favorite' },
            { status: 500 }
        );
    }
}


