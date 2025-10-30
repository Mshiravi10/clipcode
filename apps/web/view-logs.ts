import { prisma } from './lib/prisma';

async function viewLogs() {
    console.log('=== Error Logs Summary ===\n');

    const summary = await prisma.$queryRaw<Array<{ level: string; count: bigint }>>`
        SELECT level, COUNT(*) as count
        FROM "ErrorLog"
        GROUP BY level
        ORDER BY count DESC
    `;

    summary.forEach(row => {
        console.log(`${row.level.padEnd(8)}: ${row.count} errors`);
    });

    console.log('\n=== Recent Errors (Last 10) ===\n');

    const recentErrors = await prisma.errorLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            level: true,
            message: true,
            createdAt: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    recentErrors.forEach((log, index) => {
        console.log(`${index + 1}. [${log.level.toUpperCase()}] ${log.message.substring(0, 80)}`);
        console.log(`   User: ${log.user?.email || 'N/A'} | Time: ${log.createdAt.toISOString()}\n`);
    });

    console.log('=== Errors with Stack Traces ===\n');

    const errorsWithStack = await prisma.errorLog.findMany({
        where: {
            stackTrace: {
                not: null,
            },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            level: true,
            message: true,
            createdAt: true,
        },
    });

    errorsWithStack.forEach((log, index) => {
        console.log(`${index + 1}. [${log.level.toUpperCase()}] ${log.message.substring(0, 80)}`);
        console.log(`   Time: ${log.createdAt.toISOString()}\n`);
    });

    console.log('=== OAuth Events ===\n');

    const oauthEvents = await prisma.errorLog.findMany({
        where: {
            message: {
                contains: 'OAuth',
            },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            message: true,
            createdAt: true,
            context: true,
        },
    });

    oauthEvents.forEach((log, index) => {
        console.log(`${index + 1}. ${log.message}`);
        console.log(`   Time: ${log.createdAt.toISOString()}\n`);
    });

    await prisma.$disconnect();
}

viewLogs().catch(console.error);

