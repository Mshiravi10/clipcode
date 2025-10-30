import {
    handleApiError,
    notFoundResponse,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth-helpers';
import { AUDIT_ACTIONS, ENTITIES, ERROR_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { updateSnippetSchema } from '@/lib/validators';
import { autoVersionSnippet } from '@/lib/versioning';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Fetch snippet (by id or slug)
        const snippet = await prisma.snippet.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { slug: params.id },
                ],
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                collection: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (!snippet) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Check access: owner or public snippet
        const isOwner = snippet.ownerId === user.id;
        const isPublic = (snippet as any).isPublic;
        if (!isOwner && !isPublic) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        return successResponse(snippet);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check ownership
        const existing = await prisma.snippet.findFirst({
            where: {
                id: params.id,
                ownerId: user.id,
            },
        });

        if (!existing) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Parse and validate body
        const body = await request.json();
        const data = updateSnippetSchema.parse(body);

        // Auto-create version if code has changed significantly
        if (data.code && data.code !== existing.code) {
            await autoVersionSnippet(params.id, user.id, {
                title: data.title || existing.title,
                code: existing.code, // Save the OLD code as a version
                description: existing.description || undefined,
                language: existing.language,
                framework: existing.framework || undefined,
            });
        }

        // Delete existing tags if new tags are provided
        if (data.tags) {
            await prisma.snippetTag.deleteMany({
                where: { snippetId: params.id },
            });
        }

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

        // Update snippet
        const snippet = await prisma.snippet.update({
            where: { id: params.id },
            data: {
                title: data.title,
                language: data.language,
                framework: data.framework,
                description: data.description,
                code: data.code,
                placeholders: data.placeholders
                    ? JSON.stringify(data.placeholders)
                    : undefined,
                collectionId: data.collectionId,
                isFavorite: data.isFavorite,
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
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
            AUDIT_ACTIONS.UPDATED_SNIPPET,
            ENTITIES.SNIPPET,
            snippet.id,
            user.id
        );

        return successResponse(snippet);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check ownership
        const existing = await prisma.snippet.findFirst({
            where: {
                id: params.id,
                ownerId: user.id,
            },
        });

        if (!existing) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Delete snippet (cascades to tags and favorites)
        await prisma.snippet.delete({
            where: { id: params.id },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.DELETED_SNIPPET,
            ENTITIES.SNIPPET,
            params.id,
            user.id,
            {
                title: existing.title,
            }
        );

        return successResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}


