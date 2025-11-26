# 33 - User Analytics Integration

**Priority:** 🟡 High
**Effort:** Medium (1 week)
**Impact:** Medium
**Dependencies:** None

## Problem
@vercel/analytics installed but not fully implemented. TODOs mention "Send to your analytics service". Cannot track user behavior, feature usage, or conversion funnels.

## Requirements
1. Integrate PostHog or Mixpanel for product analytics
2. Track key user actions (CV generation, profile updates, etc.)
3. Implement event tracking with properties
4. Set up conversion funnels (signup → first CV)
5. Track feature usage and adoption
6. Implement user identification and profiles
7. Set up cohort analysis
8. Track user journey and session recordings
9. Implement A/B testing framework
10. Create analytics dashboard for team
11. Set up automated reports
12. Ensure GDPR compliance (consent, data retention)

## Acceptance Criteria
- [ ] Analytics tool integrated (PostHog/Mixpanel)
- [ ] Key events tracked with properties
- [ ] User identification working
- [ ] Conversion funnels configured
- [ ] Feature usage tracked
- [ ] Session recordings enabled (with consent)
- [ ] A/B testing framework ready
- [ ] Dashboard accessible to team
- [ ] GDPR compliance implemented
- [ ] Documentation of tracked events

## Technical Considerations
- Choose PostHog for open-source option
- Track events client and server-side
- Implement consent management
- Anonymize PII before tracking
- Set data retention policies
- Monitor analytics costs
- Use environment-specific projects

## Files Affected
- `src/lib/analytics.ts` (enhance)
- Event tracking throughout app
- `src/components/cookie-consent.tsx` (new)
- `.env.example` (analytics keys)

## Testing Requirements
- Verify events tracked correctly
- Test user identification
- Test consent flow
- Verify PII not leaked
