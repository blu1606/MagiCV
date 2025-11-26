/**
 * In-Memory Rate Limiting
 * Uses LRU cache for token bucket algorithm
 * Note: This is per-instance. For distributed systems, use Redis-backed solution.
 */

import { LRUCache } from 'lru-cache';
import { RateLimitError } from './errors';

interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the time window
     */
    maxRequests: number;
    /**
     * Time window in seconds
     */
    windowSeconds: number;
    /**
     * Optional: Different limits for different user tiers
     */
    tierLimits?: {
        free?: number;
        premium?: number;
        admin?: number;
    };
}

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

// Rate limit configurations for different endpoint types
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    CV_GENERATION: {
        maxRequests: 10,
        windowSeconds: 600, // 10 minutes
        tierLimits: {
            free: 10,
            premium: 50,
            admin: Infinity,
        }
    },
    API_QUERY: {
        maxRequests: 100,
        windowSeconds: 60, // 1 minute
        tierLimits: {
            free: 100,
            premium: 500,
            admin: Infinity,
        }
    },
    FILE_UPLOAD: {
        maxRequests: 5,
        windowSeconds: 3600, // 1 hour
        tierLimits: {
            free: 5,
            premium: 20,
            admin: Infinity,
        }
    },
    AUTH_ATTEMPT: {
        maxRequests: 5,
        windowSeconds: 900, // 15 minutes
    },
    DEFAULT: {
        maxRequests: 60,
        windowSeconds: 60, // 1 minute
    }
};

// LRU cache to store rate limit buckets
// Max 10,000 entries, TTL based on longest window (1 hour)
const rateLimitCache = new LRUCache<string, TokenBucket>({
    max: 10000,
    ttl: 3600 * 1000, // 1 hour in milliseconds
});

/**
 * Get rate limit for a specific user tier
 */
function getRateLimitForTier(
    config: RateLimitConfig,
    tier: 'free' | 'premium' | 'admin' = 'free'
): number {
    if (config.tierLimits && config.tierLimits[tier] !== undefined) {
        return config.tierLimits[tier]!;
    }
    return config.maxRequests;
}

/**
 * Check and consume rate limit using token bucket algorithm
 * Returns remaining tokens if allowed, throws RateLimitError if exceeded
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
    tier: 'free' | 'premium' | 'admin' = 'free'
): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    limit: number;
}> {
    const limit = getRateLimitForTier(config, tier);
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    // Admin bypass
    if (tier === 'admin' || limit === Infinity) {
        return {
            allowed: true,
            remaining: Infinity,
            resetAt: new Date(now + windowMs),
            limit: Infinity,
        };
    }

    // Get or create token bucket
    let bucket = rateLimitCache.get(identifier);

    if (!bucket) {
        // First request, create new bucket
        bucket = {
            tokens: limit - 1, // Consume one token
            lastRefill: now,
        };
        rateLimitCache.set(identifier, bucket);

        return {
            allowed: true,
            remaining: bucket.tokens,
            resetAt: new Date(now + windowMs),
            limit,
        };
    }

    // Refill tokens based on time elapsed (token bucket with continuous refill)
    const timeElapsed = now - bucket.lastRefill;
    const refillRate = limit / config.windowSeconds; // tokens per second
    const tokensToAdd = (timeElapsed / 1000) * refillRate;

    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request is allowed
    if (bucket.tokens >= 1) {
        // Allow request, consume token
        bucket.tokens -= 1;
        rateLimitCache.set(identifier, bucket);

        return {
            allowed: true,
            remaining: Math.floor(bucket.tokens),
            resetAt: new Date(now + windowMs),
            limit,
        };
    }

    // Rate limit exceeded
    const timeUntilNextToken = (1 - bucket.tokens) / refillRate; // seconds
    const resetAt = new Date(now + timeUntilNextToken * 1000);

    return {
        allowed: false,
        remaining: 0,
        resetAt,
        limit,
    };
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
    identifier: string,
    config: RateLimitConfig,
    tier: 'free' | 'premium' | 'admin' = 'free'
): Promise<void> {
    const result = await checkRateLimit(identifier, config, tier);

    if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);

        throw new RateLimitError(
            'Too many requests. Please try again later.',
            retryAfter,
            {
                limit: result.limit,
                remaining: result.remaining,
                resetAt: result.resetAt.toISOString(),
            }
        );
    }
}

/**
 * Get identifier from request (user ID or IP address)
 */
export function getRateLimitIdentifier(
    userId?: string,
    ip?: string,
    endpoint?: string
): string {
    const base = userId || ip || 'anonymous';
    const scope = endpoint ? `:${endpoint}` : '';
    return `ratelimit:${base}${scope}`;
}

/**
 * Rate limit headers for response
 */
export function getRateLimitHeaders(result: {
    limit: number;
    remaining: number;
    resetAt: Date;
}): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
    };
}

/**
 * Clear rate limit for an identifier (e.g., after successful login)
 */
export function clearRateLimit(identifier: string): void {
    rateLimitCache.delete(identifier);
}

/**
 * Get current rate limit status without consuming a token
 */
export async function getRateLimitStatus(
    identifier: string,
    config: RateLimitConfig,
    tier: 'free' | 'premium' | 'admin' = 'free'
): Promise<{
    remaining: number;
    resetAt: Date;
    limit: number;
}> {
    const limit = getRateLimitForTier(config, tier);
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    if (tier === 'admin' || limit === Infinity) {
        return {
            remaining: Infinity,
            resetAt: new Date(now + windowMs),
            limit: Infinity,
        };
    }

    const bucket = rateLimitCache.get(identifier);

    if (!bucket) {
        return {
            remaining: limit,
            resetAt: new Date(now + windowMs),
            limit,
        };
    }

    // Calculate current tokens without consuming
    const timeElapsed = now - bucket.lastRefill;
    const refillRate = limit / config.windowSeconds;
    const tokensToAdd = (timeElapsed / 1000) * refillRate;
    const currentTokens = Math.min(limit, bucket.tokens + tokensToAdd);

    return {
        remaining: Math.floor(currentTokens),
        resetAt: new Date(now + windowMs),
        limit,
    };
}
