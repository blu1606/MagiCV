# 03 - CSRF Protection

**Priority:** 🔴 Critical
**Effort:** Medium (1 week)
**Impact:** High
**Dependencies:** None

## Problem
API routes accept state-changing requests without CSRF token validation. Malicious sites can trigger unwanted actions on behalf of authenticated users (delete CVs, generate fake content, change profile).

## Requirements
1. Implement CSRF protection using edge-csrf or similar library
2. Generate unique CSRF tokens per session
3. Validate tokens on all state-changing operations (POST, PUT, DELETE, PATCH)
4. Exempt safe operations (GET, HEAD, OPTIONS)
5. Return 403 Forbidden for invalid tokens
6. Rotate tokens after authentication changes
7. Support both cookie-based and header-based tokens
8. Handle token in Next.js Server Actions
9. Implement double-submit cookie pattern as fallback

## Acceptance Criteria
- [ ] CSRF middleware active on all routes
- [ ] Tokens generated and stored securely
- [ ] All POST/PUT/DELETE/PATCH validate tokens
- [ ] 403 response for missing/invalid tokens
- [ ] GET requests exempted from validation
- [ ] Client-side token inclusion helper
- [ ] Token rotation on auth events
- [ ] Documentation for API consumers
- [ ] Penetration test confirms protection

## Technical Considerations
- Use httpOnly, secure, sameSite=strict cookies
- Consider CORS implications
- Handle mobile app authentication differently
- Implement token in forms and AJAX calls
- Ensure compatibility with Next.js App Router

## Files Affected
- `src/middleware.ts` (CSRF validation)
- `src/lib/csrf.ts` (new)
- `src/app/api/**/route.ts` (token validation)
- Client components (token inclusion)

## Testing Requirements
- Security tests attempting CSRF attacks
- Verify token validation on all endpoints
- Test token rotation scenarios
