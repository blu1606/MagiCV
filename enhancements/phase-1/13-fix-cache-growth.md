# 13 - Fix Unbounded Cache Growth with LRU

**Priority:** 🔴 Critical
**Effort:** Low (1-2 days)
**Impact:** High
**Dependencies:** None

## Problem
embedding-cache-service.ts uses unbounded Map for caching. Cache grows indefinitely causing memory leak. Will eventually crash application under load. Current: `private static cache = new Map<string, CachedEmbedding>()`

## Requirements
1. Replace Map with LRU (Least Recently Used) cache
2. Set maximum cache size (1000 entries recommended)
3. Set TTL (time to live) for cache entries (1 hour)
4. Implement cache eviction policy
5. Track cache statistics (hits, misses, evictions)
6. Implement cache size monitoring
7. Add cache warming for common queries
8. Provide cache clear functionality
9. Log cache metrics periodically
10. Make cache size configurable via environment variable

## Acceptance Criteria
- [ ] LRU cache implemented with max size
- [ ] Cache size stays bounded under load
- [ ] TTL configured (1 hour default)
- [ ] Cache statistics tracked accurately
- [ ] Hit rate calculated and logged
- [ ] Cache warming implemented for common embeddings
- [ ] Environment variable for cache size
- [ ] Load testing confirms no memory leak
- [ ] Documentation updated

## Technical Considerations
- Use lru-cache npm package
- Consider memory footprint of embeddings (768-dim vectors)
- Balance cache size with memory availability
- Monitor cache hit rate for optimization
- Consider Redis migration path (Phase 1, item 14)

## Files Affected
- `src/services/embedding-cache-service.ts` (modify cache implementation)
- `.env.example` (add CACHE_SIZE variable)

## Testing Requirements
- Load test with sustained traffic
- Monitor memory usage over time
- Verify cache eviction works correctly
- Test cache hit/miss tracking
