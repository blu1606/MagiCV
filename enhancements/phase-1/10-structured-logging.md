# 10 - Structured Logging with Winston/Pino

**Priority:** 🟡 High
**Effort:** Medium (1-2 weeks)
**Impact:** Medium
**Dependencies:** 08-error-handling.md

## Problem
53 console.error/warn statements scattered throughout codebase. No structured logging, difficult to query/analyze logs, no log levels, no correlation IDs. Production debugging is painful.

## Requirements
1. Replace all console.* with structured logging library (Winston or Pino)
2. Implement log levels: error, warn, info, http, debug
3. Use JSON format for production logs
4. Use pretty format for development logs
5. Add correlation IDs to track requests across services
6. Include context in logs (userId, endpoint, timestamp, environment)
7. Implement log rotation and retention policies
8. Send production logs to external service (LogDNA, Datadog)
9. Add performance metrics to logs
10. Implement sampling for high-volume logs
11. Create logging middleware for HTTP requests
12. Sanitize sensitive data before logging

## Acceptance Criteria
- [ ] All console.* replaced with logger
- [ ] Log levels used appropriately
- [ ] JSON logs in production, pretty in dev
- [ ] Correlation IDs in all logs
- [ ] Context data included (user, endpoint)
- [ ] Logs sent to external service
- [ ] Sensitive data automatically redacted
- [ ] HTTP request/response logging active
- [ ] Documentation for logging standards

## Technical Considerations
- Choose Pino for better performance
- Use pino-http for request logging
- Configure transports for external services
- Implement log rotation with daily-rotate-file
- Monitor log volume and costs

## Files Affected
- `src/lib/logger.ts` (new)
- All files with console.* (53 occurrences)
- `src/middleware.ts` (request logging)

## Testing Requirements
- Verify log format in different environments
- Test sensitive data redaction
- Test log levels and filtering
