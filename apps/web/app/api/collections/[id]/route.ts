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
import { updateCollectionSchema } from '@/lib/validators';
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

        // Fetch collection
        const collection = await prisma.collection.findFirst({
            where: {
                id: params.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                snippets: {
                    include: {
                        tags: {
                            include: {
                                tag: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { snippets: true },
                },
            },
        });

        if (!collection) {
            return notFoundResponse(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
        }

        // Check access: owner or public collection
        const isOwner = collection.ownerId === user.id;
        const isPublic = (collection as any).isPublic;
        if (!isOwner && !isPublic) {
            return notFoundResponse(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
        }

        return successResponse(collection);
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
        const existing = await prisma.collection.findFirst({
            where: {
                id: params.id,
                ownerId: user.id,
            },
        });

        if (!existing) {
            return notFoundResponse(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
        }

        // Parse and validate body
        const body = await request.json();
        const data = updateCollectionSchema.parse(body);

        // Update collection
        const collection = await prisma.collection.update({
            where: { id: params.id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            },
            include: {
                _count: {
                    select: { snippets: true },
                },
            },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.UPDATED_COLLECTION,
            ENTITIES.COLLECTION,
            collection.id,
            user.id
        );

        return successResponse(collection);
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
        const existing = await prisma.collection.findFirst({
            where: {
                id: params.id,
                ownerId: user.id,
            },
        });

        if (!existing) {
            return notFoundResponse(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
        }

        // Delete collection (snippets are preserved with onDelete: SetNull)
        await prisma.collection.delete({
            where: { id: params.id },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.DELETED_COLLECTION,
            ENTITIES.COLLECTION,
            params.id,
            user.id,
            {
                name: existing.name,
            }
        );

        return successResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}

