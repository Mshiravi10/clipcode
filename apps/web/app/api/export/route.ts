import { logAudit } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { format = 'json', snippetIds } = body;

        const where: any = {
            ownerId: session.user.id,
        };

        if (snippetIds && snippetIds.length > 0) {
            where.id = {
                in: snippetIds,
            };
        }

        const snippets = await prisma.snippet.findMany({
            where,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                collection: true,
            },
        });

        await logAudit('EXPORTED_SNIPPETS', 'SNIPPET', undefined, session.user.id, {
            count: snippets.length,
            format,
        });

        if (format === 'json') {
            const data = {
                snippets: snippets.map(s => ({
                    title: s.title,
                    language: s.language,
                    framework: s.framework,
                    description: s.description,
                    code: s.code,
                    tags: s.tags.map(t => t.tag.slug),
                    collection: s.collection?.name,
                })),
                exportedAt: new Date().toISOString(),
                count: snippets.length,
            };

            return new NextResponse(JSON.stringify(data, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="snippets-${Date.now()}.json"`,
                },
            });
        } else {
            const markdown = snippets
                .map(s => {
                    const frontMatter = [
                        '---',
                        `title: ${s.title}`,
                        `language: ${s.language}`,
                        s.framework ? `framework: ${s.framework}` : '',
                        s.description ? `description: ${s.description}` : '',
                        s.tags.length > 0 ? `tags: [${s.tags.map(t => t.tag.slug).join(', ')}]` : '',
                        '---',
                        '',
                    ]
                        .filter(Boolean)
                        .join('\n');

                    return `${frontMatter}\n\`\`\`${s.language}\n${s.code}\n\`\`\`\n\n---\n`;
                })
                .join('\n');

            return new NextResponse(markdown, {
                headers: {
                    'Content-Type': 'text/markdown',
                    'Content-Disposition': `attachment; filename="snippets-${Date.now()}.md"`,
                },
            });
        }
    } catch (error) {
        console.error('POST /api/export error:', error);
        return NextResponse.json(
            { error: 'Failed to export snippets' },
            { status: 500 }
        );
    }
}


