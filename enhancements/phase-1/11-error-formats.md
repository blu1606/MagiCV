# 11 - Standardized Error Response Formats

**Priority:** 🟡 High
**Effort:** Low (3-5 days)
**Impact:** Medium
**Dependencies:** 08-error-handling.md

## Problem
API routes return inconsistent error formats - some strings, some objects, different structures. Client-side error handling is difficult and brittle. No standardization across 40 routes.

## Requirements
1. Define single standard error response format for all APIs
2. Include error code, message, details, timestamp, request ID
3. Support nested validation errors with field paths
4. Implement error response builder utility
5. Document error codes and meanings
6. Provide helpful suggestions for error resolution
7. Include links to documentation for common errors
8. Support both single errors and multiple errors
9. Implement consistent HTTP status code mapping
10. Add deprecation warnings in responses
11. Version the error response format

## Standard Error Format:
```
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    details: [
      { field: "email", message: "Invalid email format" }
    ],
    timestamp: "2025-11-26T10:00:00Z",
    requestId: "abc123",
    documentation: "https://docs.magicv.ai/errors/validation"
  }
}
```

## Acceptance Criteria
- [ ] All API routes use standard format
- [ ] Error response builder utility created
- [ ] Error codes documented
- [ ] Validation errors show field paths
- [ ] Request IDs included in all errors
- [ ] Client library updated to parse format
- [ ] Documentation published
- [ ] Backward compatibility maintained

## Technical Considerations
- Use TypeScript interfaces for type safety
- Create error response factory functions
- Consider API versioning strategy
- Handle edge cases (network errors, timeouts)

## Files Affected
- `src/lib/api-response.ts` (new)
- `src/app/api/**/route.ts` (40 routes)
- API documentation

## Testing Requirements
- Test all error scenarios return standard format
- Verify client can parse all error types
