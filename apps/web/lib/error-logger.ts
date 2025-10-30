import { prisma } from './prisma';

export interface LogContext {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    userId?: string;
    sessionData?: any;
    requestBody?: any;
    responseData?: any;
    ipAddress?: string;
    userAgent?: string;
}

function safeStringify(obj: any): string | null {
    if (!obj) return null;
    try {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, val) => {
            if (val != null && typeof val === 'object') {
                if (seen.has(val)) {
                    return '[Circular]';
                }
                seen.add(val);
            }
            return val;
        }, 2);
    } catch (error) {
        return String(obj);
    }
}

export async function logError(
    message: string,
    error?: Error,
    context?: LogContext,
    level: 'error' | 'warn' | 'info' | 'debug' = 'error'
) {
    try {
        const stackTrace = error?.stack || undefined;
        const env = process.env.NODE_ENV || 'development';

        await prisma.errorLog.create({
            data: {
                level,
                message,
                stackTrace,
                context: context ? safeStringify(context) : undefined,
                userId: context?.userId,
                sessionData: context?.sessionData ? safeStringify(context.sessionData) : undefined,
                requestBody: context?.requestBody ? safeStringify(context.requestBody) : undefined,
                responseData: context?.responseData ? safeStringify(context.responseData) : undefined,
                environment: env,
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
            },
        });
    } catch (logError) {
        console.error('Failed to log error:', logError);
    }
}

export async function logOAuthEvent(
    event: string,
    data: {
        provider?: string;
        state?: string;
        code?: string;
        cookies?: Record<string, string>;
        redirectChain?: string[];
        userId?: string;
        sessionData?: any;
    }
) {
    try {
        const context: LogContext = {
            userId: data.userId,
            sessionData: data.sessionData,
            cookies: data.cookies,
        };

        const message = `OAuth Event: ${event}${data.provider ? ` [Provider: ${data.provider}]` : ''}${data.state ? ` [State: ${data.state}]` : ''}`;

        await logError(message, undefined, context, 'info');
    } catch (error) {
        console.error('Failed to log OAuth event:', error);
    }
}

export async function logSessionAttempt(
    success: boolean,
    details: Record<string, any>
) {
    try {
        const context: LogContext = {
            userId: details.userId,
            sessionData: details.sessionData,
            cookies: details.cookies,
        };

        const message = `Session ${success ? 'created' : 'failed'}`;

        await logError(message, undefined, context, success ? 'info' : 'warn');
    } catch (error) {
        console.error('Failed to log session attempt:', error);
    }
}

export async function logRequest(
    request: Request,
    userId?: string,
    sessionData?: any
) {
    try {
        const url = request.url;
        const method = request.method;
        const headers = Object.fromEntries(request.headers.entries());
        const cookies = headers['cookie'] ? parseCookies(headers['cookie']) : undefined;

        const context: LogContext = {
            url,
            method,
            headers,
            cookies,
            userId,
            sessionData,
            userAgent: headers['user-agent'],
        };

        await logError(`${method} ${url}`, undefined, context, 'info');
    } catch (error) {
        console.error('Failed to log request:', error);
    }
}

function parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieString.split(';').forEach(cookie => {
        const [key, value] = cookie.split('=').map(c => c.trim());
        if (key) cookies[key] = value || '';
    });
    return cookies;
}

