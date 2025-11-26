# 34 - OpenAPI/Swagger API Documentation

**Priority:** 🟢 Medium
**Effort:** Medium (1-2 weeks)
**Impact:** Medium
**Dependencies:** 11-error-formats.md

## Problem
40 API routes without documentation. Hard for developers to understand API structure, parameters, responses. No interactive testing capability.

## Requirements
1. Generate OpenAPI 3.0 specification
2. Document all 40 API routes
3. Include request/response schemas
4. Document authentication requirements
5. Provide example requests and responses
6. Document error codes and meanings
7. Set up Swagger UI for interactive testing
8. Auto-generate docs from code where possible
9. Include rate limiting information
10. Version the API documentation
11. Host documentation publicly or internally
12. Keep docs in sync with code

## Acceptance Criteria
- [ ] OpenAPI spec generated for all routes
- [ ] Swagger UI accessible and functional
- [ ] All routes documented with examples
- [ ] Schemas defined for all models
- [ ] Authentication documented
- [ ] Error responses documented
- [ ] Interactive testing working
- [ ] Docs versioned with API
- [ ] CI/CD validates spec on changes
- [ ] Developer feedback positive

## Technical Considerations
- Use next-swagger-doc or swagger-jsdoc
- Auto-generate from TypeScript types where possible
- Use JSDoc comments for route documentation
- Host on /api/docs or separate domain
- Implement API versioning strategy
- Keep spec in version control

## Files Affected
- `src/lib/swagger.ts` (spec generation)
- `src/app/api-docs/page.tsx` (Swagger UI)
- JSDoc comments in API routes
- `swagger.json` (generated spec)

## Testing Requirements
- Verify spec validates (Swagger validator)
- Test all examples work
- Verify interactive testing functional
