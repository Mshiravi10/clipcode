import {
    handleApiError,
    notFoundResponse,
    successResponse,
    unauthorizedResponse,
} from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ENTITIES, ERROR_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import {
    extractVariables,
    renderTemplate,
    renderTemplatePreview,
    validateTemplate,
} from '@/lib/template';
import { renderTemplateSchema } from '@/lib/validators';
import { NextRequest } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const rateLimit = checkRateLimit(request, { maxRequests: 100 });
        if (!rateLimit.allowed) {
            return handleApiError(new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED));
        }

        // Authentication
        const user = await getCurrentUser();
        if (!user?.id) {
            return unauthorizedResponse();
        }

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

        // Parse and validate body
        const body = await request.json();
        const data = renderTemplateSchema.parse(body);

        // Validate template syntax
        const validation = await validateTemplate(snippet.code);
        if (!validation.valid) {
            return handleApiError(
                new Error(`Template validation failed: ${validation.error}`)
            );
        }

        // Render template
        const rendered = await renderTemplate(snippet.code, data.variables);

        // Extract variables for reference
        const variables = extractVariables(snippet.code);

        // Audit log
        await logAudit(
            'RENDERED_TEMPLATE',
            ENTITIES.SNIPPET,
            snippet.id,
            user.id,
            {
                variableCount: Object.keys(data.variables || {}).length,
            }
        );

        return successResponse({
            rendered,
            variables,
            template: snippet.code,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

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

        // Extract variables
        const variables = extractVariables(snippet.code);

        // Validate template
        const validation = await validateTemplate(snippet.code);

        // Generate preview with example values
        let preview: string | null = null;
        if (validation.valid) {
            try {
                preview = await renderTemplatePreview(snippet.code);
            } catch (error) {
                // Preview generation failed, but that's okay
                preview = null;
            }
        }

        return successResponse({
            variables,
            validation,
            preview,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

