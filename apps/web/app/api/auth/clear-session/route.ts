import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Clear all sessions from database
        await prisma.session.deleteMany();

        // Clear cookies
        const response = NextResponse.json({
            success: true,
            message: 'All sessions cleared',
        });

        // Delete all NextAuth cookies
        const cookieNames = [
            'next-auth.session-token',
            '__Secure-next-auth.session-token',
            'next-auth.callback-url',
            '__Secure-next-auth.callback-url',
            'next-auth.csrf-token',
            '__Host-next-auth.csrf-token',
        ];

        cookieNames.forEach((name) => {
            response.cookies.set(name, '', {
                expires: new Date(0),
                path: '/',
            });
        });

        return response;
    } catch (error) {
        console.error('Error clearing sessions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear sessions' },
            { status: 500 }
        );
    }
}

