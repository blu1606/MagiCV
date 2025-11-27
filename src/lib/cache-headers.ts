/**
 * Cache Headers Utility
 * Provides standardized caching strategies for different content types
 */

export interface CacheConfig {
  maxAge?: number; // in seconds
  sMaxAge?: number; // CDN cache time
  staleWhileRevalidate?: number;
  staleIfError?: number;
  public?: boolean;
  private?: boolean;
  noStore?: boolean;
  noCache?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
  vary?: string[];
}

/**
 * Build Cache-Control header from config
 */
export function buildCacheControl(config: CacheConfig): string {
  const directives: string[] = [];

  // Cache visibility
  if (config.public) directives.push('public');
  if (config.private) directives.push('private');
  if (config.noStore) directives.push('no-store');
  if (config.noCache) directives.push('no-cache');

  // Max age directives
  if (config.maxAge !== undefined) directives.push(`max-age=${config.maxAge}`);
  if (config.sMaxAge !== undefined) directives.push(`s-maxage=${config.sMaxAge}`);

  // Revalidation
  if (config.mustRevalidate) directives.push('must-revalidate');
  if (config.immutable) directives.push('immutable');

  // Stale handling
  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  if (config.staleIfError !== undefined) {
    directives.push(`stale-if-error=${config.staleIfError}`);
  }

  return directives.join(', ');
}

/**
 * Predefined caching strategies
 */
export const CACHE_STRATEGIES = {
  // Static assets (images, fonts, etc.) - cache for 1 year
  STATIC_ASSET: {
    public: true,
    maxAge: 31536000, // 1 year
    immutable: true,
  },

  // Generated PDFs - cache for 1 year (immutable URLs)
  PDF: {
    public: true,
    maxAge: 31536000, // 1 year
    immutable: true,
  },

  // User-specific data - private, short cache
  USER_DATA: {
    private: true,
    maxAge: 60, // 1 minute
    mustRevalidate: true,
  },

  // Public API data - cache with revalidation
  PUBLIC_API: {
    public: true,
    maxAge: 300, // 5 minutes
    sMaxAge: 600, // 10 minutes on CDN
    staleWhileRevalidate: 60,
  },

  // Dynamic content - cache with frequent revalidation
  DYNAMIC: {
    public: true,
    maxAge: 60, // 1 minute
    sMaxAge: 300, // 5 minutes on CDN
    staleWhileRevalidate: 30,
  },

  // No cache - always fresh
  NO_CACHE: {
    noStore: true,
    noCache: true,
  },

  // Short cache for frequently changing data
  SHORT_CACHE: {
    public: true,
    maxAge: 30, // 30 seconds
    mustRevalidate: true,
  },

  // Medium cache for semi-static content
  MEDIUM_CACHE: {
    public: true,
    maxAge: 3600, // 1 hour
    sMaxAge: 7200, // 2 hours on CDN
    staleWhileRevalidate: 300,
  },

  // Long cache for rarely changing content
  LONG_CACHE: {
    public: true,
    maxAge: 86400, // 1 day
    sMaxAge: 172800, // 2 days on CDN
    staleWhileRevalidate: 3600,
  },
} as const;

/**
 * Generate ETag from content
 */
export function generateETag(content: string | Buffer): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(typeof content === 'string' ? content : content.toString());
  return `"${hash.digest('hex').substring(0, 16)}"`;
}

/**
 * Check if request has matching ETag
 */
export function checkETag(requestETag: string | null, currentETag: string): boolean {
  if (!requestETag) return false;
  return requestETag === currentETag;
}

/**
 * Build headers object with caching
 */
export function buildCacheHeaders(
  strategy: CacheConfig,
  options?: {
    etag?: string;
    vary?: string[];
    lastModified?: Date;
  }
): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': buildCacheControl(strategy),
  };

  // Add ETag if provided
  if (options?.etag) {
    headers['ETag'] = options.etag;
  }

  // Add Vary header
  const varyHeaders = options?.vary || strategy.vary || [];
  if (varyHeaders.length > 0) {
    headers['Vary'] = varyHeaders.join(', ');
  }

  // Add Last-Modified if provided
  if (options?.lastModified) {
    headers['Last-Modified'] = options.lastModified.toUTCString();
  }

  return headers;
}

/**
 * Apply cache headers to Next.js Response
 */
export function applyCacheHeaders(
  headers: Headers,
  strategy: CacheConfig,
  options?: {
    etag?: string;
    vary?: string[];
    lastModified?: Date;
  }
): void {
  const cacheHeaders = buildCacheHeaders(strategy, options);
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

/**
 * Check if response should be cached based on status
 */
export function shouldCache(status: number): boolean {
  // Only cache successful responses
  return status >= 200 && status < 300;
}

/**
 * Get cache strategy based on content type
 */
export function getCacheStrategyForContentType(contentType: string): CacheConfig {
  if (contentType.includes('application/pdf')) {
    return CACHE_STRATEGIES.PDF;
  }
  if (contentType.includes('image/') || contentType.includes('font/')) {
    return CACHE_STRATEGIES.STATIC_ASSET;
  }
  if (contentType.includes('application/json')) {
    return CACHE_STRATEGIES.PUBLIC_API;
  }
  return CACHE_STRATEGIES.DYNAMIC;
}
