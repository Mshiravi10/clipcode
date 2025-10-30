import { logAudit } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug';
import matter from 'gray-matter';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const content = await file.text();
        const fileType = file.name.endsWith('.json') ? 'json' : 'markdown';

        let snippetsData: Array<{
            title: string;
            language: string;
            framework?: string;
            description?: string;
            code: string;
            tags?: string[];
        }> = [];

        if (fileType === 'json') {
            const parsed = JSON.parse(content);
            snippetsData = parsed.snippets || [];
        } else {
            const parsed = matter(content);
            const metadata = parsed.data;
            const code = parsed.content.trim();

            snippetsData = [
                {
                    title: metadata.title || 'Imported Snippet',
                    language: metadata.language || 'text',
                    framework: metadata.framework,
                    description: metadata.description,
                    code,
                    tags: metadata.tags || [],
                },
            ];
        }

        const imported = [];
        const skipped = [];

        for (const data of snippetsData) {
            try {
                const slug = await generateUniqueSlug(data.title, 'snippet');

                const snippet = await prisma.snippet.create({
                    data: {
                        title: data.title,
                        slug,
                        language: data.language,
                        framework: data.framework,
                        description: data.description,
                        code: data.code,
                        ownerId: session.user.id,
                        tags: data.tags
                            ? {
                                create: await Promise.all(
                                    data.tags.map(async tagSlug => {
                                        const tag = await prisma.tag.upsert({
                                            where: { slug: tagSlug },
                                            update: {},
                                            create: {
                                                name: tagSlug,
                                                slug: tagSlug,
                                            },
                                        });
                                        return {
                                            tagId: tag.id,
                                        };
                                    })
                                ),
                            }
                            : undefined,
                    },
                });

                imported.push(snippet);
            } catch (error) {
                console.error('Error importing snippet:', error);
                skipped.push(data.title);
            }
        }

        await logAudit('IMPORTED_SNIPPETS', 'SNIPPET', undefined, session.user.id, {
            count: imported.length,
            skipped: skipped.length,
        });

        return NextResponse.json({
            data: {
                imported: imported.length,
                skipped: skipped.length,
                snippets: imported,
            },
        });
    } catch (error) {
        console.error('POST /api/import error:', error);
        return NextResponse.json(
            { error: 'Failed to import snippets' },
            { status: 500 }
        );
    }
}


