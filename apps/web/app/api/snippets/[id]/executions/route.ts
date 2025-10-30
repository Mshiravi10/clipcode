import {
    handleApiError,
    notFoundResponse,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ERROR_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
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

        // Fetch snippet to verify ownership
        const snippet = await prisma.snippet.findFirst({
            where: {
                OR: [{ id: params.id }, { slug: params.id }],
                ownerId: user.id,
            },
        });

        if (!snippet) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Fetch executions
        const [executions, total] = await Promise.all([
            prisma.snippetExecution.findMany({
                where: {
                    snippetId: snippet.id,
                    userId: user.id,
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
                select: {
                    id: true,
                    input: true,
                    output: true,
                    error: true,
                    duration: true,
                    language: true,
                    createdAt: true,
                },
            }),
            prisma.snippetExecution.count({
                where: {
                    snippetId: snippet.id,
                    userId: user.id,
                },
            }),
        ]);

        return successResponse({
            executions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

