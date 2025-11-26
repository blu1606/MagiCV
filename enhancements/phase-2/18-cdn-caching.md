# 18 - CDN Caching Headers

**Priority:** 🟡 High
**Effort:** Low (1-2 days)
**Impact:** Medium
**Dependencies:** None

## Problem
No caching headers on responses. Generated PDFs and static assets not cached. Every request hits origin servers. Missing performance optimization and increased costs.

## Requirements
1. Add Cache-Control headers to all appropriate responses
2. PDF responses: max-age=31536000 (1 year), immutable
3. Static assets: max-age=31536000, immutable
4. API responses: appropriate caching based on endpoint
5. User-specific content: private, must-revalidate
6. Public content: public, max-age based on update frequency
7. Add ETag support for conditional requests
8. Implement cache invalidation strategy
9. Configure Vercel Edge caching
10. Add Vary headers for content negotiation

## Acceptance Criteria
- [ ] All responses have appropriate Cache-Control headers
- [ ] PDFs cached for 1 year
- [ ] Static assets cached correctly
- [ ] User content marked private
- [ ] ETags generated and validated
- [ ] Cache hit rate > 70% after warmup
- [ ] Performance improvement measured
- [ ] Documentation of caching strategy

## Technical Considerations
- Use Next.js built-in caching where possible
- Be careful with user-specific data (use private)
- Implement cache busting with version/hash in URLs
- Monitor CDN costs and hit rates
- Test cache behavior in different scenarios

## Files Affected
- `src/app/api/**/route.ts` (add headers)
- `next.config.ts` (CDN configuration)
- PDF generation routes

## Testing Requirements
- Verify cache headers in responses
- Test conditional requests (304)
- Measure performance improvement
