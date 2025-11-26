# 49 - LinkedIn OAuth 2.0 Implementation

**Priority:** 🔵 Low
**Effort:** High (2-3 weeks)
**Impact:** Medium
**Dependencies:** 48-user-profile.md

## Problem
lib/api-service.ts has placeholder: "TODO: Implement actual LinkedIn OAuth login". Cannot import user data from LinkedIn. Manual profile entry is tedious.

## Requirements
1. Create LinkedIn OAuth app in LinkedIn Developer Portal
2. Implement OAuth 2.0 authorization code flow
3. Request appropriate OAuth scopes (r_liteprofile, r_emailaddress, w_member_social)
4. Handle OAuth callback and token exchange
5. Fetch user profile data from LinkedIn API
6. Auto-populate user profile with LinkedIn data
7. Handle OAuth errors gracefully
8. Implement token refresh mechanism
9. Store OAuth tokens securely
10. Allow users to disconnect LinkedIn
11. Fetch work experience from LinkedIn
12. Fetch education from LinkedIn
13. Fetch skills from LinkedIn

## Acceptance Criteria
- [ ] LinkedIn OAuth app configured
- [ ] OAuth flow functional (authorize → callback → token)
- [ ] User profile auto-populated from LinkedIn
- [ ] Work experience imported
- [ ] Education imported
- [ ] Skills imported
- [ ] Token refresh working
- [ ] Secure token storage
- [ ] Disconnect functionality working
- [ ] Error handling comprehensive
- [ ] User testing confirms ease of use

## Technical Considerations
- Use NextAuth.js LinkedIn provider
- Store tokens encrypted in database
- Respect LinkedIn API rate limits
- Handle expired/revoked tokens
- Map LinkedIn data to app schema
- Consider data sync frequency
- Handle partial import failures

## Files Affected
- `src/lib/auth.ts` (OAuth configuration)
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/services/linkedin-service.ts` (new)
- Profile import UI components

## Testing Requirements
- Test complete OAuth flow
- Test error scenarios
- Test data import accuracy
- Test token refresh
- Test disconnect functionality
