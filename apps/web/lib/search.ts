import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export interface SearchFilters {
    q?: string;
    language?: string;
    framework?: string;
    tags?: string[];
    favorite?: boolean;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    cursor?: string;
}

export interface SearchResult {
    snippets: Array<{
        id: string;
        title: string;
        slug: string;
        language: string;
        framework: string | null;
        description: string | null;
        code: string;
        isFavorite: boolean;
        usageCount: number;
        createdAt: Date;
        updatedAt: Date;
        owner: {
            id: string;
            name: string | null;
            image: string | null;
        };
        collection: {
            id: string;
            name: string;
            slug: string;
        } | null;
        tags: Array<{
            tag: {
                id: string;
                name: string;
                slug: string;
            };
        }>;
    }>;
    nextCursor?: string;
    total: number;
}

export async function searchSnippets(
    userId: string,
    filters: SearchFilters
): Promise<SearchResult> {
    const { q, language, framework, tags, favorite, dateFrom, dateTo, limit = 20, cursor } = filters;

    const where: Prisma.SnippetWhereInput = {
        ownerId: userId,
    };

    if (q && q.trim()) {
        const searchQuery = q.trim();

        const fullTextQuery = searchQuery
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => `${word}:*`)
            .join(' & ');

        where.OR = [
            {
                tsv: {
                    not: undefined,
                },
            },
            {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
            {
                code: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            },
        ];

        if (fullTextQuery) {
            const rawQuery = `
        SELECT id FROM "Snippet"
        WHERE "ownerId" = $1
        AND tsv @@ to_tsquery('simple', $2)
        ORDER BY ts_rank(tsv, to_tsquery('simple', $2)) DESC
      `;

            try {
                const fullTextResults = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
                    rawQuery,
                    userId,
                    fullTextQuery
                );

                if (fullTextResults.length > 0) {
                    where.OR.push({
                        id: {
                            in: fullTextResults.map(r => r.id),
                        },
                    });
                }
            } catch (error) {
                console.error('Full-text search error:', error);
            }
        }
    }

    if (language) {
        where.language = {
            equals: language,
            mode: 'insensitive',
        };
    }

    if (framework) {
        where.framework = {
            equals: framework,
            mode: 'insensitive',
        };
    }

    if (tags && tags.length > 0) {
        where.tags = {
            some: {
                tag: {
                    slug: {
                        in: tags,
                    },
                },
            },
        };
    }

    if (favorite !== undefined) {
        where.isFavorite = favorite;
    }

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
            where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
            where.createdAt.lte = new Date(dateTo);
        }
    }

    if (cursor) {
        where.id = {
            lt: cursor,
        };
    }

    const [snippets, total] = await Promise.all([
        prisma.snippet.findMany({
            where,
            take: limit + 1,
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                collection: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.snippet.count({ where }),
    ]);

    const hasMore = snippets.length > limit;
    const results = hasMore ? snippets.slice(0, limit) : snippets;

    return {
        snippets: results,
        nextCursor: hasMore ? results[results.length - 1].id : undefined,
        total,
    };
}

export async function fuzzySearchSnippets(
    userId: string,
    query: string,
    limit: number = 10
): Promise<Array<{ id: string; title: string; similarity: number }>> {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const rawQuery = `
    SELECT id, title, similarity(title, $2) as sim
    FROM "Snippet"
    WHERE "ownerId" = $1
    AND similarity(title, $2) > 0.3
    ORDER BY sim DESC
    LIMIT $3
  `;

    try {
        const results = await prisma.$queryRawUnsafe<
            Array<{ id: string; title: string; sim: number }>
        >(rawQuery, userId, query.trim(), limit);

        return results.map(r => ({
            id: r.id,
            title: r.title,
            similarity: r.sim,
        }));
    } catch (error) {
        console.error('Fuzzy search error:', error);
        return [];
    }
}


