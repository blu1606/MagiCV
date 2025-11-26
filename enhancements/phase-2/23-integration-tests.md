# 23 - Integration Tests for External Services

**Priority:** 🟡 High
**Effort:** Medium (2 weeks)
**Impact:** Medium
**Dependencies:** None

## Problem
Only 1 integration test file (supabase). No tests for Google AI API, LaTeX compilation, OAuth, or file uploads. Cannot verify external service integrations work correctly.

## Requirements
1. Create integration tests for Google AI API (embeddings, LLM)
2. Test LaTeX PDF compilation (online and offline compilers)
3. Test OAuth flows when implemented (LinkedIn, Google)
4. Test file upload/download workflows
5. Test Supabase operations comprehensively
6. Test email sending if implemented
7. Mock external services in non-prod environments
8. Use real services in staging tests
9. Implement retry logic for flaky external services
10. Test error handling for service failures
11. Test rate limiting behavior

## Acceptance Criteria
- [ ] Google AI API integration tested
- [ ] LaTeX compilation tested (both modes)
- [ ] File operations tested
- [ ] Supabase operations comprehensively tested
- [ ] OAuth flows tested when implemented
- [ ] Service failure scenarios tested
- [ ] Tests use appropriate mocking
- [ ] Staging environment uses real services
- [ ] Test execution time reasonable
- [ ] CI/CD runs integration tests

## Technical Considerations
- Use .env.test for test environment config
- Mock expensive operations in unit tests
- Use real services in integration tests
- Implement test data seeding
- Clean up test data after runs
- Handle API rate limits in tests

## Files Affected
- `src/services/__tests__/integration/*.test.ts`
- `tests/integration/**/*.test.ts`
- Test fixtures and helpers

## Testing Requirements
- All external integrations covered
- Tests handle transient failures gracefully
- Test data cleanup automated
