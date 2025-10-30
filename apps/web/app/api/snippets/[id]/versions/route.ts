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
import { getVersionHistory } from '@/lib/versioning';
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

        // Find snippet
        const snippet = await prisma.snippet.findFirst({
            where: {
                OR: [{ id: params.id }, { slug: params.id }],
                ownerId: user.id,
            },
        });

        if (!snippet) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Get version history
        const versions = await getVersionHistory(snippet.id, user.id);

        return successResponse({ versions });
    } catch (error) {
        return handleApiError(error);
    }
}

