import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiSuccess<T = any> {
    data: T;
    error?: never;
}

export interface ApiError {
    error: string;
    details?: any;
    data?: never;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json({ data } as ApiSuccess<T>, { status });
}

export function errorResponse(
    message: string,
    status: number = 500,
    details?: any
) {
    return NextResponse.json(
        { error: message, details } as ApiError,
        { status }
    );
}

export function validationErrorResponse(error: ZodError) {
    return errorResponse(
        'Validation error',
        400,
        error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
        }))
    );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = 'Forbidden') {
    return errorResponse(message, 403);
}

export function notFoundResponse(message: string = 'Not found') {
    return errorResponse(message, 404);
}

export function conflictResponse(message: string = 'Conflict') {
    return errorResponse(message, 409);
}

export function tooManyRequestsResponse(
    message: string = 'Too many requests'
) {
    return errorResponse(message, 429);
}

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
        return validationErrorResponse(error);
    }

    if (error instanceof Error) {
        // Don't expose internal error messages in production
        const message =
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message;
        return errorResponse(message, 500);
    }

    return errorResponse('Internal server error', 500);
}

