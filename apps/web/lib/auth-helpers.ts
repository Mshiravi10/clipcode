import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }
    return session;
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

export async function isAdmin() {
    const user = await getCurrentUser();
    if (!user?.id) return false;

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
    });

    return dbUser?.role === 'admin';
}

export async function requireAdmin() {
    const session = await requireAuth();
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    return session;
}


