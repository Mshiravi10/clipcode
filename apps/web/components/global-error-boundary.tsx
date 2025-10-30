'use client';

import { useEffect } from 'react';

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            const message = event.message || 'Unknown error';
            const error = event.error || new Error(message);

            fetch('/api/client-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    stack: error.stack,
                    context: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                    },
                }),
            }).catch(() => {
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message = event.reason?.message || String(event.reason) || 'Unhandled promise rejection';
            const error = event.reason instanceof Error ? event.reason : new Error(message);

            fetch('/api/client-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    stack: error.stack,
                    context: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                    },
                }),
            }).catch(() => {
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return <>{children}</>;
}

