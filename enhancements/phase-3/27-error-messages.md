# 27 - User-Friendly Error Messages

**Priority:** 🟡 High
**Effort:** Low (3-5 days)
**Impact:** High
**Dependencies:** 11-error-formats.md

## Problem
Technical error messages shown to users: "Failed to generate embedding: 500 Internal Server Error". Not actionable, confusing, frustrating. No guidance on resolution.

## Requirements
1. Replace all technical errors with user-friendly messages
2. Provide clear explanation of what went wrong
3. Suggest specific actions to resolve the issue
4. Include "try again" buttons where appropriate
5. Provide support contact for persistent issues
6. Add error illustrations/icons for context
7. Use empathetic tone in messaging
8. Avoid jargon and technical terms
9. Link to relevant help documentation
10. Provide error reference IDs for support
11. Localize error messages for international users

## Acceptance Criteria
- [ ] All user-facing errors have friendly messages
- [ ] Each error suggests resolution action
- [ ] Support reference IDs included
- [ ] Error messages tested with users
- [ ] No technical jargon in messages
- [ ] Empathetic tone throughout
- [ ] Help links included where relevant
- [ ] Mobile-friendly error display
- [ ] Screen reader friendly
- [ ] Error message library documented

## Technical Considerations
- Create error message dictionary
- Map technical errors to user messages
- A/B test message effectiveness
- Consider user context in messaging
- Maintain consistency across app
- Support i18n from start

## Files Affected
- `src/lib/error-messages.ts` (new dictionary)
- All components displaying errors
- Error boundary fallbacks

## Testing Requirements
- User testing of error messages
- Verify all error paths show friendly messages
- Test help links work correctly
