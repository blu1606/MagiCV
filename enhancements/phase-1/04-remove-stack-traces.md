# 04 - Remove Stack Traces from Production

**Priority:** 🔴 Critical
**Effort:** Low (1-2 days)
**Impact:** Medium
**Dependencies:** None

## Problem
Error responses expose full stack traces in production, revealing internal file structure, package versions, and implementation details. This information aids attackers in reconnaissance.

## Requirements
1. Detect production environment (NODE_ENV === 'production')
2. Remove stack traces from all error responses in production
3. Keep stack traces in development for debugging
4. Replace technical errors with user-friendly messages
5. Log full errors server-side for debugging
6. Generate error IDs for correlation between user and logs
7. Remove sensitive data from error messages (paths, API keys)
8. Implement consistent error response structure
9. Handle edge cases (unhandled rejections, middleware errors)

## Acceptance Criteria
- [ ] No stack traces in production API responses
- [ ] Stack traces available in development
- [ ] User-friendly error messages shown
- [ ] Full errors logged server-side with IDs
- [ ] Error IDs returned to users for support
- [ ] Sensitive data stripped from messages
- [ ] Global error handler catches all errors
- [ ] Manual security review confirms no leaks

## Technical Considerations
- Use environment variable for mode detection
- Implement in centralized error handler
- Handle Next.js error boundaries separately
- Consider source map protection
- Ensure TypeScript error types handled

## Files Affected
- `src/lib/error-handler.ts` (enhance)
- `src/app/api/**/route.ts` (use handler)
- `src/middleware.ts` (global error catch)

## Testing Requirements
- Test production mode error responses
- Verify no sensitive data leaks
- Test various error types (validation, runtime, unhandled)
