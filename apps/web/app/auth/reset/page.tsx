'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetAuthPage() {
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);
    const [isCleared, setIsCleared] = useState(false);

    async function clearSession() {
        setIsClearing(true);
        try {
            // Clear session via API
            const response = await fetch('/api/auth/clear-session', {
                method: 'POST',
            });

            if (response.ok) {
                // Clear all cookies manually
                const cookiesToClear = [
                    'next-auth.session-token',
                    '__Secure-next-auth.session-token',
                    'next-auth.callback-url',
                    '__Secure-next-auth.callback-url',
                    'next-auth.csrf-token',
                    '__Host-next-auth.csrf-token',
                ];

                cookiesToClear.forEach((name) => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                });

                setIsCleared(true);

                // Wait and then redirect
                setTimeout(() => {
                    // Force a hard reload to clear everything
                    window.location.href = '/auth/signin';
                }, 1500);
            } else {
                alert('Failed to clear session. Please try manually clearing cookies.');
                setIsClearing(false);
            }
        } catch (error) {
            console.error('Error clearing session:', error);
            alert('Error: ' + error);
            setIsClearing(false);
        }
    }

    if (isCleared) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            <CardTitle>Session Cleared!</CardTitle>
                        </div>
                        <CardDescription>
                            Redirecting to sign in page...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset Authentication</CardTitle>
                    <CardDescription>
                        Clear all sessions and cookies to fix login issues
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                        <strong>Note:</strong> This will log out all users and clear all sessions from the database.
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>This will:</p>
                        <ul className="ml-4 list-disc space-y-1">
                            <li>Delete all sessions from the database</li>
                            <li>Clear all NextAuth cookies</li>
                            <li>Redirect you to the sign-in page</li>
                        </ul>
                    </div>

                    <Button
                        onClick={clearSession}
                        disabled={isClearing}
                        className="w-full"
                        size="lg"
                    >
                        {isClearing ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Clearing...
                            </>
                        ) : (
                            'Clear Session & Reset'
                        )}
                    </Button>

                    <div className="text-center">
                        <Button
                            variant="link"
                            onClick={() => router.push('/auth/signin')}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

