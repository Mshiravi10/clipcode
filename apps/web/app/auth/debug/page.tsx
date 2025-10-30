import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

export default async function AuthDebugPage() {
    const cookieStore = cookies();
    const session = await getServerSession(authOptions);

    // Get all NextAuth cookies
    const sessionTokenCookie = cookieStore.get('next-auth.session-token');
    const callbackUrlCookie = cookieStore.get('next-auth.callback-url');
    const csrfTokenCookie = cookieStore.get('next-auth.csrf-token');

    // Get session from database if token exists
    let dbSession = null;
    if (sessionTokenCookie?.value) {
        dbSession = await prisma.session.findUnique({
            where: {
                sessionToken: sessionTokenCookie.value,
            },
            include: {
                user: true,
            },
        });
    }

    // Get all sessions from database
    const allSessions = await prisma.session.findMany({
        include: {
            user: true,
        },
        orderBy: {
            expires: 'desc',
        },
        take: 10,
    });

    // Get recent auth logs
    const recentLogs = await prisma.log.findMany({
        where: {
            source: 'auth',
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">🔍 Authentication Debug</h1>
                    <div className="flex gap-2">
                        <a
                            href="/auth/reset"
                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Reset Auth
                        </a>
                        <a
                            href="/auth/signin"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Sign In
                        </a>
                    </div>
                </div>

                {/* Session Status */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Session Status:{' '}
                        {session ? (
                            <span className="text-green-600">✓ Active</span>
                        ) : (
                            <span className="text-red-600">✗ Not Authenticated</span>
                        )}
                    </h2>
                    {session && (
                        <pre className="overflow-auto rounded bg-slate-100 p-4">
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    )}
                </div>

                {/* Cookies */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Cookies</h2>
                    <div className="space-y-2">
                        <div>
                            <strong>Session Token:</strong>{' '}
                            {sessionTokenCookie ? (
                                <code className="rounded bg-slate-100 px-2 py-1">
                                    {sessionTokenCookie.value.substring(0, 20)}...
                                </code>
                            ) : (
                                <span className="text-red-600">Not Found</span>
                            )}
                        </div>
                        <div>
                            <strong>Callback URL:</strong>{' '}
                            {callbackUrlCookie ? (
                                <code className="rounded bg-slate-100 px-2 py-1">
                                    {callbackUrlCookie.value}
                                </code>
                            ) : (
                                <span className="text-gray-500">None</span>
                            )}
                        </div>
                        <div>
                            <strong>CSRF Token:</strong>{' '}
                            {csrfTokenCookie ? (
                                <code className="rounded bg-slate-100 px-2 py-1">
                                    {csrfTokenCookie.value.substring(0, 20)}...
                                </code>
                            ) : (
                                <span className="text-red-600">Not Found</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Database Session */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Database Session:{' '}
                        {dbSession ? (
                            <span className="text-green-600">✓ Found</span>
                        ) : (
                            <span className="text-red-600">✗ Not Found</span>
                        )}
                    </h2>
                    {dbSession ? (
                        <div>
                            <p>
                                <strong>User:</strong> {dbSession.user.email}
                            </p>
                            <p>
                                <strong>Expires:</strong>{' '}
                                {new Date(dbSession.expires).toLocaleString()}
                            </p>
                            <p>
                                <strong>Is Expired:</strong>{' '}
                                {new Date(dbSession.expires) < new Date() ? (
                                    <span className="text-red-600">Yes</span>
                                ) : (
                                    <span className="text-green-600">No</span>
                                )}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No session found in database matching the cookie token.
                        </p>
                    )}
                </div>

                {/* All Sessions */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        All Sessions ({allSessions.length})
                    </h2>
                    {allSessions.length > 0 ? (
                        <div className="overflow-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="pb-2">User</th>
                                        <th className="pb-2">Token</th>
                                        <th className="pb-2">Expires</th>
                                        <th className="pb-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allSessions.map((s) => (
                                        <tr key={s.id} className="border-b">
                                            <td className="py-2">{s.user.email}</td>
                                            <td className="py-2">
                                                <code className="text-xs">
                                                    {s.sessionToken.substring(0, 15)}...
                                                </code>
                                            </td>
                                            <td className="py-2">
                                                {new Date(s.expires).toLocaleString()}
                                            </td>
                                            <td className="py-2">
                                                {new Date(s.expires) < new Date() ? (
                                                    <span className="text-red-600">Expired</span>
                                                ) : (
                                                    <span className="text-green-600">Valid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No sessions in database.</p>
                    )}
                </div>

                {/* Recent Logs */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">
                        Recent Auth Logs ({recentLogs.length})
                    </h2>
                    {recentLogs.length > 0 ? (
                        <div className="space-y-2">
                            {recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded border border-slate-200 p-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${log.level === 'error'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                >
                                                    {log.level}
                                                </span>
                                                <span className="font-medium">
                                                    {log.message}
                                                </span>
                                            </div>
                                            {log.context && (
                                                <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">
                                                    {log.context}
                                                </pre>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No auth logs found.</p>
                    )}
                </div>

                {/* Environment Info */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Environment</h2>
                    <div className="space-y-1 text-sm">
                        <p>
                            <strong>NEXTAUTH_URL:</strong>{' '}
                            {process.env.NEXTAUTH_URL || 'Not set'}
                        </p>
                        <p>
                            <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
                        </p>
                        <p>
                            <strong>GITHUB_ID:</strong>{' '}
                            {process.env.GITHUB_ID ? '✓ Set' : '✗ Not set'}
                        </p>
                        <p>
                            <strong>GITHUB_SECRET:</strong>{' '}
                            {process.env.GITHUB_SECRET ? '✓ Set' : '✗ Not set'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

