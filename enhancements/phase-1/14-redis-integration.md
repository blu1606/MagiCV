# 14 - Redis Distributed Caching Integration

**Priority:** 🟡 High
**Effort:** High (2-3 weeks)
**Impact:** High
**Dependencies:** 13-fix-cache-growth.md

## Problem
In-memory cache clears on restart. No shared cache across multiple instances. Repeated expensive API calls to Google AI. Session data not shared. Need distributed caching for production scalability.

## Requirements
1. Set up Redis instance (Upstash recommended for serverless)
2. Migrate embedding cache from in-memory to Redis
3. Implement session caching in Redis
4. Cache API responses with appropriate TTLs
5. Implement cache warming strategy on startup
6. Add cache invalidation patterns (tags, keys)
7. Implement cache-aside pattern for embeddings
8. Use Redis pub/sub for cache invalidation across instances
9. Monitor Redis memory usage and set eviction policy
10. Implement graceful fallback if Redis unavailable
11. Add Redis connection pooling
12. Cache expensive database queries

## Acceptance Criteria
- [ ] Redis instance operational (Upstash or self-hosted)
- [ ] Embedding cache persists across restarts
- [ ] Session data shared across instances
- [ ] Cache hit rate > 80% for embeddings
- [ ] Graceful degradation when Redis down
- [ ] Cache invalidation working correctly
- [ ] Redis memory usage monitored
- [ ] Connection pooling configured
- [ ] Load testing shows performance improvement
- [ ] Documentation for cache patterns

## Technical Considerations
- Use ioredis for Node.js Redis client
- Implement retry logic with exponential backoff
- Set maxmemory-policy to allkeys-lru
- Serialize complex objects (JSON or MessagePack)
- Monitor Redis costs (Upstash pricing)
- Consider Redis Cluster for high availability

## Files Affected
- `src/lib/redis.ts` (new Redis client)
- `src/services/embedding-cache-service.ts` (use Redis)
- `src/middleware.ts` (session caching)
- `.env.example` (Redis connection string)

## Testing Requirements
- Test cache persistence across restarts
- Test multi-instance cache sharing
- Test failover when Redis unavailable
- Load test with Redis caching
