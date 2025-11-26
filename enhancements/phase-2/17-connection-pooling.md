# 17 - Database Connection Pooling

**Priority:** 🟡 High
**Effort:** Low (2-3 days)
**Impact:** Medium
**Dependencies:** None

## Problem
Supabase client created as singleton without visible connection pool configuration. Could hit connection limits under load. No connection reuse strategy evident.

## Requirements
1. Configure Supabase client with connection pooling
2. Set pool size based on expected load (start with 20)
3. Configure connection timeouts (30 seconds)
4. Implement idle connection cleanup
5. Monitor connection pool metrics (active, idle, waiting)
6. Add connection pool exhaustion alerts
7. Implement connection retry logic
8. Configure statement timeout (10 seconds)
9. Use transaction pooling for read operations
10. Document connection pool configuration

## Acceptance Criteria
- [ ] Connection pool configured with max size
- [ ] Pool metrics monitored and logged
- [ ] Connection timeouts configured
- [ ] Idle connections cleaned up automatically
- [ ] Pool exhaustion handling tested
- [ ] Retry logic implemented
- [ ] Load testing shows no connection errors
- [ ] Documentation updated

## Technical Considerations
- Use Supabase's pgBouncer for connection pooling
- Transaction pooling for reads, session pooling for writes
- Monitor Supabase dashboard for connection metrics
- Adjust pool size based on load testing
- Consider separate pools for read/write

## Files Affected
- `src/lib/supabase.ts` (client configuration)
- `.env.example` (pool size variables)

## Testing Requirements
- Load test with high concurrency
- Test pool exhaustion scenario
- Monitor connection metrics under load
