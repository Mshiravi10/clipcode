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
import { NextRequest } from 'next/server';
import { z } from 'zod';

const executeSchema = z.object({
    code: z.string().optional(),
    input: z.string().optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting - stricter for execution
        const rateLimit = checkRateLimit(request, { maxRequests: 20 });
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
                OR: [{ id: params.id }, { slug: params.id }],
                ownerId: user.id,
            },
        });

        if (!snippet) {
            return notFoundResponse(ERROR_MESSAGES.SNIPPET_NOT_FOUND);
        }

        // Parse request body
        const body = await request.json();
        const data = executeSchema.parse(body);

        // The actual execution happens client-side for security
        // This endpoint just records the execution attempt
        const startTime = Date.now();

        // Simulate execution recording (actual execution is client-side)
        // In a real implementation, you might want to execute server-side in a container
        const execution = await prisma.snippetExecution.create({
            data: {
                snippetId: snippet.id,
                userId: user.id,
                input: data.input || null,
                output: 'Execution completed', // Placeholder
                error: null,
                duration: Date.now() - startTime,
                language: snippet.language,
            },
        });

        // Update snippet execute count
        await prisma.snippet.update({
            where: { id: snippet.id },
            data: {
                executeCount: { increment: 1 },
                usageCount: { increment: 1 },
            },
        });

        // Audit log
        await logAudit(
            AUDIT_ACTIONS.EXECUTED_SNIPPET,
            ENTITIES.SNIPPET,
            snippet.id,
            user.id
        );

        return successResponse({
            executionId: execution.id,
            message: 'Execution request recorded',
        });
    } catch (error) {
        return handleApiError(error);
    }
}

