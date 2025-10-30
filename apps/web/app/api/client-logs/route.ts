import { logError } from '@/lib/error-logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, stack, context } = body;

        const error = new Error(message);
        error.stack = stack;

        await logError(message, error, context);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to log client error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

