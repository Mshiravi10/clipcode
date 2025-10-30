import {
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth-helpers';
import { AUDIT_ACTIONS, ENTITIES, ERROR_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchSnippets } from '@/lib/search';
import { generateUniqueSlug } from '@/lib/slug';
import { createSnippetSchema, searchSnippetsSchema } from '@/lib/validators';
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
        const filters = searchSnippetsSchema.parse({
            q: searchParams.get('q') || undefined,
            language: searchParams.get('language') || undefined,
            framework: searchParams.get('framework') || undefined,
            tags: searchParams.getAll('tags'),
            favorite: searchParams.get('favorite') === 'true' ? true : undefined,
            dateFrom: searchParams.get('dateFrom') || undefined,
            dateTo: searchParams.get('dateTo') || undefined,
            limit: searchParams.get('limit')
                ? parseInt(searchParams.get('limit')!)
                : undefined,
            cursor: searchParams.get('cursor') || undefined,
        });

        // Execute search
        const result = await searchSnippets(user.id, filters);

        return successResponse(result);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimit = checkRateLimit(request, { maxRequests: 50 });
        if (!rateLimit.allowed) {
            return handleApiError(new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED));
        }

        // Authentication
        const user = await getCurrentUser();
        if (!user?.id) {
            return unauthorizedResponse();
        }

        // Parse and validate body
        const body = await request.json();
        const data = createSnippetSchema.parse(body);

        // Validate collection exists if provided
        if (data.collectionId) {
            const collection = await prisma.collection.findUnique({
                where: { id: data.collectionId },
            });
            if (!collection) {
                return handleApiError(new Error('Collection not found'));
            }
            // Ensure user owns the collection
            if (collection.ownerId !== user.id) {
                return handleApiError(new Error('You do not have permission to add snippets to this collection'));
            }
        }

        // Generate unique slug
        const slug = await generateUniqueSlug(data.title, 'snippet');

        // Create tag connections
        const tagConnections = data.tags
            ? await Promise.all(
                data.tags.map(async (tagSlug) => {
                    const tag = await prisma.tag.upsert({
                        where: { slug: tagSlug },
                        update: {},
                        create: {
                            name: tagSlug,
                            slug: tagSlug,
                        },
                    });
                    return { tagId: tag.id };
                })
            )
            : [];

        // Create snippet
        const snippet = await prisma.snippet.create({
            data: {
                title: data.title,
                slug,
                language: data.language,
                framework: data.framework,
                description: data.description,
                code: data.code,
                placeholders: data.placeholders
                    ? JSON.stringify(data.placeholders)
                    : null,
                ownerId: user.id,
                collectionId: data.collectionId,
                isPublic: data.isPublic ?? false,
                tags: tagConnections.length > 0 ? { create: tagConnections } : undefined,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                collection: true,
            },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.CREATED_SNIPPET,
            ENTITIES.SNIPPET,
            snippet.id,
            user.id,
            {
                title: snippet.title,
                language: snippet.language,
            }
        );

        return successResponse(snippet, 201);
    } catch (error) {
        return handleApiError(error);
    }
}


