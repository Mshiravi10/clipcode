import {
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ERROR_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimit = checkRateLimit(request);
        if (!rateLimit.allowed) {
            return handleApiError(new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED));
        }

        // Authentication
        const user = await getCurrentUser();
        if (!user?.id) {
            return unauthorizedResponse();
        }

        // Parse search parameters
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get('q') || '';
        const language = searchParams.get('language');
        const framework = searchParams.get('framework');
        const tags = searchParams.getAll('tags');

        // Build where clause
        const where: any = {
            isPublic: true,
        };

        if (language && language !== 'all') {
            where.language = language;
        }

        if (framework && framework !== 'all') {
            where.framework = framework;
        }

        if (tags.length > 0) {
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

        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
            ];
        }

        // Fetch public snippets
        const snippets = await prisma.snippet.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                collection: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        isPublic: true,
                    },
                },
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });

        return successResponse(snippets);
    } catch (error) {
        return handleApiError(error);
    }
}

