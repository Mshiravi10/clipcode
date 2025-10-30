import {
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ERROR_MESSAGES } from '@/lib/constants';
import {
    pullAllGists,
    pullGistAsSnippet,
    pushSnippetToGist,
    syncSnippetWithGist,
} from '@/lib/gist-sync';
import { checkRateLimit } from '@/lib/rate-limit';
import { pullGistsSchema, syncGistSchema } from '@/lib/validators';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimit = checkRateLimit(request, { maxRequests: 20 });
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
        const data = syncGistSchema.parse(body);

        // Get Gist token from user preferences or request
        // For now, expect it in the request body
        const token = body.token;
        if (!token) {
            return handleApiError(new Error('Gist token is required'));
        }

        // Determine sync direction
        if (data.snippetId && data.gistId) {
            // Bidirectional sync
            const result = await syncSnippetWithGist(
                data.snippetId,
                data.gistId,
                user.id,
                token
            );
            return successResponse(result);
        } else if (data.snippetId) {
            // Push snippet to new Gist
            const gist = await pushSnippetToGist(data.snippetId, user.id, token);
            return successResponse({ action: 'pushed', gist });
        } else if (data.gistId) {
            // Pull Gist as new snippet
            const snippetIds = await pullGistAsSnippet(data.gistId, user.id, token);
            return successResponse({ action: 'pulled', snippetIds });
        } else {
            return handleApiError(
                new Error('Either snippetId or gistId must be provided')
            );
        }
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimit = checkRateLimit(request, { maxRequests: 10 });
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
        const options = pullGistsSchema.parse({
            limit: searchParams.get('limit')
                ? parseInt(searchParams.get('limit')!)
                : undefined,
        });

        // Get Gist token from query or user preferences
        const token = searchParams.get('token');
        if (!token) {
            return handleApiError(new Error('Gist token is required'));
        }

        // Pull all Gists
        const result = await pullAllGists(user.id, token, options.limit);

        return successResponse(result);
    } catch (error) {
        return handleApiError(error);
    }
}

