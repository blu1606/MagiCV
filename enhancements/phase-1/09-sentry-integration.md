# 09 - Sentry Integration for Error Tracking

**Priority:** 🟡 High
**Effort:** Medium (1 week)
**Impact:** High
**Dependencies:** 08-error-handling.md

## Problem
TODOs mention Sentry but not implemented. No external error monitoring makes debugging production issues extremely difficult. Cannot track error trends, user impact, or performance issues.

## Requirements
1. Install and configure @sentry/nextjs
2. Set up separate Sentry projects for client/server/edge
3. Configure error capturing with context (user, session, breadcrumbs)
4. Implement source map upload for readable stack traces
5. Set up performance monitoring (transactions, spans)
6. Configure breadcrumbs for user actions and API calls
7. Implement custom error tags (environment, version, feature)
8. Set up error grouping and fingerprinting
9. Configure alerting rules for critical errors
10. Add session replay for debugging user issues
11. Filter sensitive data before sending to Sentry
12. Set sampling rates (100% errors, 10% transactions)

## Acceptance Criteria
- [ ] Sentry SDK installed and configured
- [ ] Errors automatically captured with context
- [ ] Source maps uploaded for production
- [ ] Performance transactions tracked
- [ ] Breadcrumbs show user journey
- [ ] Sensitive data filtered (PII, tokens)
- [ ] Alerts configured for critical errors
- [ ] Team receives test error successfully
- [ ] Dashboard shows error trends

## Technical Considerations
- Use Sentry's Next.js integration
- Configure release tracking with git commits
- Set appropriate data scrubbing rules
- Monitor Sentry quota usage
- Use environment tags for filtering

## Files Affected
- `sentry.client.config.ts` (new)
- `sentry.server.config.ts` (new)
- `sentry.edge.config.ts` (new)
- `next.config.ts` (Sentry webpack plugin)
- `package.json` (add @sentry/nextjs)

## Testing Requirements
- Trigger test errors in all environments
- Verify error details in Sentry dashboard
- Test source map resolution
- Verify PII filtering works
