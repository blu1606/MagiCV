# 01 - Input Validation with Zod Schemas

**Priority:** 🔴 Critical
**Effort:** Medium (1-2 weeks)
**Impact:** High
**Dependencies:** None

## Problem
Currently, 40 API routes accept user inputs without validation. Zod is installed but barely used. This creates security vulnerabilities including injection attacks, data corruption, and API misuse.

## Requirements
1. Create comprehensive Zod schemas for all API request/response types
2. Validate ALL incoming requests before processing
3. Return structured validation errors with field-level details
4. Implement schema reuse across related endpoints
5. Add request body size limits
6. Validate file uploads (type, size, content)
7. Sanitize string inputs (trim, normalize)
8. Validate URL parameters and query strings
9. Type-safe validation errors for client consumption

## Acceptance Criteria
- [ ] All 40 API routes have input validation
- [ ] Shared schemas in `src/lib/validations/` folder
- [ ] Validation errors return 400 with field details
- [ ] Request body size limited (e.g., 10MB)
- [ ] File uploads validated (MIME type, size)
- [ ] TypeScript types auto-generated from schemas
- [ ] Unit tests for all validation schemas
- [ ] Documentation of validation rules

## Technical Considerations
- Use `z.infer<>` for TypeScript type generation
- Create base schemas for common patterns (pagination, IDs)
- Implement custom Zod validators for business rules
- Consider using middleware for validation
- Handle nested object validation
- Validate environment variables on startup

## Files Affected
- `src/lib/validations/*.ts` (new schemas)
- `src/app/api/**/route.ts` (40 API routes)
- `src/middleware.ts` (validation middleware)

## Testing Requirements
- Unit tests for each schema with valid/invalid cases
- Integration tests verifying API rejection of invalid data
- Edge case testing (empty, null, undefined, malformed)
