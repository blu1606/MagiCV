# 05 - Security Headers

**Priority:** 🔴 Critical
**Effort:** Low (1-2 days)
**Impact:** High
**Dependencies:** None

## Problem
Missing security headers leave application vulnerable to clickjacking, MIME-sniffing attacks, XSS, and other client-side attacks. No Content Security Policy defined.

## Requirements
1. Implement comprehensive security headers in next.config.ts
2. Add Content-Security-Policy (CSP) with strict rules
3. Add X-Frame-Options to prevent clickjacking
4. Add X-Content-Type-Options to prevent MIME sniffing
5. Add Strict-Transport-Security (HSTS) for HTTPS
6. Add Referrer-Policy for privacy
7. Add Permissions-Policy to restrict browser features
8. Configure CSP to allow necessary resources only
9. Report CSP violations to monitoring service
10. Test headers don't break functionality

## Acceptance Criteria
- [ ] All security headers configured in next.config.ts
- [ ] CSP allows required resources (Google AI, Supabase)
- [ ] CSP blocks inline scripts except whitelisted
- [ ] X-Frame-Options set to SAMEORIGIN or DENY
- [ ] HSTS with long max-age (1+ year)
- [ ] Headers verified with security scanner
- [ ] Application functions correctly with headers
- [ ] CSP violation reporting configured

## Technical Considerations
- Use nonce-based CSP for Next.js scripts
- Whitelist trusted CDNs and APIs
- Test thoroughly before production
- Consider report-only mode initially
- Balance security with functionality

## Files Affected
- `next.config.ts` (add headers configuration)
- Potentially component files if CSP violations found

## Testing Requirements
- Scan with securityheaders.com
- Test all pages load correctly
- Verify third-party integrations work
- Test CSP violation reporting
