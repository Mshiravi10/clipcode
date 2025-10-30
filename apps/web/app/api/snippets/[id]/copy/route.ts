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

        const updated = await prisma.snippet.update({
            where: { id: params.id },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });

        await logAudit('COPIED_SNIPPET', 'SNIPPET', params.id, session.user.id);

        return NextResponse.json({ data: { usageCount: updated.usageCount } });
    } catch (error) {
        console.error('POST /api/snippets/[id]/copy error:', error);
        return NextResponse.json(
            { error: 'Failed to increment usage count' },
            { status: 500 }
        );
    }
}


