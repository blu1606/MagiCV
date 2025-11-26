# 16 - Add Cursor-Based Pagination

**Priority:** 🟡 High
**Effort:** Medium (1 week)
**Impact:** Medium
**Dependencies:** None

## Problem
Endpoints like /api/components/user/[userId] and /api/cvs return all records without pagination. Could return hundreds/thousands of items causing slow responses, high memory usage, and poor UX.

## Requirements
1. Implement cursor-based pagination (not offset-based)
2. Default page size: 20 items, max: 100 items
3. Return pagination metadata (nextCursor, hasMore, totalCount)
4. Support sorting options (date, relevance, name)
5. Implement efficient database queries with indexes
6. Add pagination to all list endpoints
7. Provide pagination helpers for consistent implementation
8. Support filtering combined with pagination
9. Cache pagination results appropriately
10. Document pagination API in OpenAPI spec

## Acceptance Criteria
- [ ] All list endpoints implement pagination
- [ ] Cursor-based pagination working correctly
- [ ] Pagination metadata in responses
- [ ] Default page size enforced (20)
- [ ] Max page size enforced (100)
- [ ] Database queries optimized with indexes
- [ ] Sorting options functional
- [ ] Client SDK updated for pagination
- [ ] Documentation published

## Technical Considerations
- Use cursor-based (not offset) for performance
- Cursor = encoded last item ID + timestamp
- Add database indexes on cursor fields
- Handle edge cases (empty results, last page)
- Consider infinite scroll UI pattern

## Files Affected
- `src/app/api/components/**/route.ts`
- `src/app/api/cvs/route.ts`
- `src/lib/pagination.ts` (new helpers)

## Testing Requirements
- Test with large datasets (1000+ items)
- Verify performance with pagination
- Test edge cases (empty, single page)
