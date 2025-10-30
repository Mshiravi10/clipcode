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
import { restoreToVersion } from '@/lib/versioning';
import { NextRequest } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string; versionId: string } }
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

        // Find snippet
        const snippet = await prisma.snippet.findFirst({
            where: {
                OR: [{ id: params.id }, { slug: params.id }],
                ownerId: user.id,
            },
        });

        if (!snippet) {
            return handleApiError(new Error(ERROR_MESSAGES.SNIPPET_NOT_FOUND));
        }

        // Restore to version
        const updatedSnippet = await restoreToVersion(
            snippet.id,
            params.versionId,
            user.id
        );

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.UPDATED_SNIPPET,
            ENTITIES.SNIPPET,
            snippet.id,
            user.id,
            { action: 'restored_version', versionId: params.versionId }
        );

        return successResponse({ snippet: updatedSnippet });
    } catch (error) {
        return handleApiError(error);
    }
}

