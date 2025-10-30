import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ isAdmin: false });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        return NextResponse.json({ isAdmin: user?.role === 'admin' });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({ isAdmin: false });
    }
}

