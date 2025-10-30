import { NextRequest } from 'next/server';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from './constants';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (request: NextRequest) => string;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
}

function getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers (considering proxies)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';

    return ip;
}

export function rateLimit(config: RateLimitConfig = {}): (request: NextRequest) => RateLimitResult {
    const {
        windowMs = RATE_LIMIT_WINDOW_MS,
        maxRequests = RATE_LIMIT_MAX_REQUESTS,
        keyGenerator = getClientIdentifier,
    } = config;

    return (request: NextRequest): RateLimitResult => {
        const key = keyGenerator(request);
        const now = Date.now();
        const resetTime = now + windowMs;

        let entry = rateLimitStore.get(key);

        if (!entry || entry.resetTime < now) {
            // Create new entry or reset expired entry
            entry = {
                count: 1,
                resetTime,
            };
            rateLimitStore.set(key, entry);

            return {
                allowed: true,
                limit: maxRequests,
                remaining: maxRequests - 1,
                resetTime,
            };
        }

        entry.count++;

        const allowed = entry.count <= maxRequests;
        const remaining = Math.max(0, maxRequests - entry.count);

        return {
            allowed,
            limit: maxRequests,
            remaining,
            resetTime: entry.resetTime,
        };
    };
}

export function checkRateLimit(
    request: NextRequest,
    config?: RateLimitConfig
): RateLimitResult {
    const limiter = rateLimit(config);
    return limiter(request);
}

