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
import { findSimilarSnippets } from '@/lib/similarity';
import { findSimilarSchema } from '@/lib/validators';
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

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const options = findSimilarSchema.parse({
            threshold: searchParams.get('threshold')
                ? parseFloat(searchParams.get('threshold')!)
                : undefined,
            limit: searchParams.get('limit')
                ? parseInt(searchParams.get('limit')!)
                : undefined,
        });

        // Fetch snippet
        const snippet = await prisma.snippet.findFirst({
            where: {
                id: params.id,
                ownerId: user.id,
            },
        });

        if (!snippet) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Find similar snippets
        const similar = await findSimilarSnippets(snippet.code, user.id, {
            ...options,
            excludeSnippetId: snippet.id,
        });

        return successResponse({
            snippet: {
                id: snippet.id,
                title: snippet.title,
                slug: snippet.slug,
            },
            similar: similar.map((match) => ({
                snippet: {
                    id: match.snippet.id,
                    title: match.snippet.title,
                    slug: match.snippet.slug,
                    language: match.snippet.language,
                    framework: match.snippet.framework,
                    description: match.snippet.description,
                    createdAt: match.snippet.createdAt,
                },
                similarity: match.similarity,
            })),
            count: similar.length,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

