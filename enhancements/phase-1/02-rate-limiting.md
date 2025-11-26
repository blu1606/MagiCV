# 02 - Rate Limiting with Upstash

**Priority:** 🔴 Critical
**Effort:** Medium (1 week)
**Impact:** High
**Dependencies:** None

## Problem
No rate limiting exists. Application vulnerable to API abuse, DDoS attacks, and runaway costs from Google AI API calls. A single user could exhaust resources or generate thousands of dollars in API bills.

## Requirements
1. Implement rate limiting using Upstash Redis + Ratelimit library
2. Apply different limits per endpoint type:
   - CV generation: 10 requests per 10 minutes per user
   - API queries: 100 requests per minute per user
   - File uploads: 5 requests per hour per user
   - Authentication: 5 failed attempts per 15 minutes per IP
3. Use sliding window algorithm for accurate limiting
4. Return standard 429 responses with retry-after headers
5. Track rate limit analytics
6. Allow admin bypass for internal operations
7. Implement IP-based limiting for unauthenticated endpoints
8. User-based limiting for authenticated endpoints

## Acceptance Criteria
- [ ] All critical endpoints have rate limits
- [ ] 429 responses with Retry-After header
- [ ] Different limits per endpoint type
- [ ] Redis-backed distributed rate limiting
- [ ] Rate limit headers in responses (X-RateLimit-*)
- [ ] Admin bypass mechanism
- [ ] Analytics dashboard showing rate limit hits
- [ ] Load testing confirms limits work under pressure

## Technical Considerations
- Use Upstash for serverless-friendly Redis
- Implement graceful degradation if Redis unavailable
- Consider user tier (free vs premium) for different limits
- Log rate limit violations for security monitoring
- Cache user tier info to reduce DB queries

## Files Affected
- `src/lib/rate-limit.ts` (new)
- `src/middleware.ts` (rate limit checks)
- `src/app/api/**/route.ts` (apply limits)

## Testing Requirements
- Load test to verify limits enforced
- Test different user scenarios
- Test Redis failure handling
