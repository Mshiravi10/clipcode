import {
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ERROR_MESSAGES } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rate-limit';
import { compareVersions } from '@/lib/versioning';
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const version1Id = searchParams.get('version1');
        const version2Id = searchParams.get('version2');

        if (!version1Id || !version2Id) {
            return handleApiError(new Error('Both version1 and version2 parameters are required'));
        }

        // Compare versions
        const comparison = await compareVersions(version1Id, version2Id, user.id);

        return successResponse(comparison);
    } catch (error) {
        return handleApiError(error);
    }
}

