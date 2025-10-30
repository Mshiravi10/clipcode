'use client';

import { SignInButton } from '@/components/auth/signin-button';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignInPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Manual redirect function
    const handleRedirect = () => {
        setIsRedirecting(true);
        const targetUrl = callbackUrl === '/' ? '/snippets' : callbackUrl;
        console.log('Manually redirecting to:', targetUrl);
        window.location.href = targetUrl;
    };

    // Log session status for debugging
    useEffect(() => {
        console.log('Session status:', status, 'User:', session?.user?.name);
    }, [status, session]);

    // Show loading state while checking or redirecting
    if (status === 'loading' || isRedirecting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isRedirecting ? 'Redirecting...' : 'Checking authentication...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">clipcode</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your personal code snippet manager
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
                        <strong>Authentication Error:</strong> {error}
                    </div>
                )}

                {status === 'authenticated' && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        <strong>✓ Successfully Signed In!</strong>
                        <p className="mt-2">
                            Welcome back, <strong>{session?.user?.name}</strong>!
                        </p>
                        <Button
                            onClick={handleRedirect}
                            disabled={isRedirecting}
                            className="mt-3 w-full"
                            variant="default"
                        >
                            {isRedirecting ? 'Redirecting...' : 'Continue to Dashboard →'}
                        </Button>
                    </div>
                )}

                {status !== 'authenticated' && (
                    <div className="mt-8 space-y-4">
                        <SignInButton callbackUrl={callbackUrl} />

                        <div className="flex justify-center gap-4 text-center text-xs">
                            <Link href="/auth/debug">
                                <Button variant="link" size="sm" className="text-xs">
                                    🔍 Debug Auth
                                </Button>
                            </Link>
                            <Link href="/auth/reset">
                                <Button variant="link" size="sm" className="text-xs text-red-600">
                                    🔄 Reset Session
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
