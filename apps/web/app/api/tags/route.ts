import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tags = await prisma.tag.findMany({
            where: {
                snippets: {
                    some: {
                        snippet: {
                            ownerId: session.user.id,
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        return NextResponse.json({ data: tags });
    } catch (error) {
        console.error('GET /api/tags error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}


