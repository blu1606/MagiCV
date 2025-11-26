/**
 * Embedding Cache Service
 * LRU cache for embeddings to reduce API calls and prevent memory leaks
 */

import { LRUCache } from 'lru-cache';

interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

export class EmbeddingCacheService {
  // Configure LRU Cache
  // Default: 1000 items, 24 hour TTL
  private static cache = new LRUCache<string, CacheEntry>({
    max: parseInt(process.env.CACHE_SIZE || '1000', 10),
    ttl: parseInt(process.env.CACHE_TTL || '86400', 10) * 1000,
    updateAgeOnGet: true,
  });

  // Statistics
  private static stats = {
    hits: 0,
    misses: 0,
  };

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
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    // console.log('✅ Embedding cache hit');
    return entry.embedding;
  }

  /**
   * Set embedding in cache
   */
  static set(text: string, embedding: number[]): void {
    const key = this.getCacheKey(text);

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
    this.stats = { hits: 0, misses: 0 };
    console.log('🗑️ Embedding cache cleared');
  }

  /**
   * Get cache stats
   */
  static getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      ttl: this.cache.ttl,
    };
  }

  /**
   * Manually prune expired entries (LRU does this automatically on access, but this forces it)
   */
  static cleanup(): void {
    this.cache.purgeStale();
  }
}

