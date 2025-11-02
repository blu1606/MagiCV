/**
 * Embedding Cache Service
 * In-memory cache for embeddings to reduce API calls
 */

interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

export class EmbeddingCacheService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key from text
   */
  private static getCacheKey(text: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `emb_${hash}_${text.length}`;
  }

  /**
   * Get embedding from cache
   */
  static get(text: string): number[] | null {
    const key = this.getCacheKey(text);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    console.log('✅ Embedding cache hit');
    return entry.embedding;
  }

  /**
   * Set embedding in cache
   */
  static set(text: string, embedding: number[]): void {
    const key = this.getCacheKey(text);

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      embedding,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  static clear(): void {
    this.cache.clear();
    console.log('🗑️ Embedding cache cleared');
  }

  /**
   * Get cache stats
   */
  static getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // TODO: Track hits/misses for accurate hit rate
    };
  }

  /**
   * Cleanup expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL_MS) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired cache entries`);
    }
  }
}

// Auto cleanup every hour (only in Node.js environment)
if (typeof setInterval !== 'undefined' && typeof window === 'undefined') {
  setInterval(() => {
    EmbeddingCacheService.cleanup();
  }, 60 * 60 * 1000);
}
