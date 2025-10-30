import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? [
                    { level: 'query', emit: 'event' },
                    { level: 'error', emit: 'stdout' },
                    { level: 'warn', emit: 'stdout' },
                ]
                : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

// Query logging in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query' as never, (e: any) => {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
    });
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}


