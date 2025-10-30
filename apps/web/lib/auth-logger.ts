import { prisma } from './prisma';

export type AuthEventType =
    | 'signin_attempt'
    | 'signin_success'
    | 'signin_error'
    | 'signout'
    | 'session_created'
    | 'session_retrieved'
    | 'session_expired'
    | 'callback_received'
    | 'jwt_created'
    | 'jwt_error'
    | 'redirect_attempt';

interface AuthEventData {
    type: AuthEventType;
    userId?: string;
    email?: string;
    sessionToken?: string;
    provider?: string;
    callbackUrl?: string;
    error?: string;
    metadata?: Record<string, any>;
}

export async function logAuthEvent(data: AuthEventData) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [AUTH] ${data.type.toUpperCase()} - ${JSON.stringify(data)}`;

    // Console log for immediate visibility
    console.log(logMessage);

    // Database log for persistence
    try {
        await prisma.log.create({
            data: {
                level: data.error ? 'error' : 'info',
                message: `Auth: ${data.type}`,
                context: JSON.stringify(data),
                source: 'auth',
                createdAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Failed to write auth log to database:', error);
    }
}

export function createAuthLogger() {
    return {
        error: (code: string, metadata?: any) => {
            logAuthEvent({
                type: 'signin_error',
                error: code,
                metadata,
            });
        },
        warn: (code: string) => {
            console.warn(`[AUTH WARNING] ${code}`);
        },
        debug: (code: string, metadata?: any) => {
            console.debug(`[AUTH DEBUG] ${code}`, metadata);
            if (process.env.NODE_ENV === 'development') {
                logAuthEvent({
                    type: 'signin_attempt',
                    metadata: { debug: code, ...metadata },
                });
            }
        },
    };
}

