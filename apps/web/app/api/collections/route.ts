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
import { generateUniqueSlug } from '@/lib/slug';
import { createCollectionSchema } from '@/lib/validators';
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

        // Get query params
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get('slug');

        // Build where clause  
        const where: any = {
            ownerId: user.id,
        };

        if (slug) {
            where.slug = slug;
        }

        // Fetch collections (only user's own for now)
        const collections = await prisma.collection.findMany({
            where,
            include: {
                _count: {
                    select: { snippets: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return successResponse(collections);
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
        const data = createCollectionSchema.parse(body);

        // Generate unique slug
        const slug = await generateUniqueSlug(data.name, 'collection');

        // Create collection
        const collection = await prisma.collection.create({
            data: {
                name: data.name,
                slug,
                ownerId: user.id,
                isPublic: data.isPublic ?? false,
            },
            include: {
                _count: {
                    select: { snippets: true },
                },
            },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.CREATED_COLLECTION,
            ENTITIES.COLLECTION,
            collection.id,
            user.id,
            {
                name: collection.name,
            }
        );

        return successResponse(collection, 201);
    } catch (error) {
        return handleApiError(error);
    }
}

