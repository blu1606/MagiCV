# 38 - Secret Management with Vault

**Priority:** 🟢 Medium
**Effort:** Medium (1-2 weeks)
**Impact:** High
**Dependencies:** None

## Problem
API keys stored in environment variables. Risk of accidental exposure in logs or errors. No automatic key rotation. No audit trail for secret access.

## Requirements
1. Set up HashiCorp Vault or AWS Secrets Manager
2. Migrate all secrets from .env to secret manager
3. Implement automatic secret rotation
4. Add audit logging for secret access
5. Use dynamic secrets where possible
6. Implement least-privilege access policies
7. Encrypt secrets at rest and in transit
8. Set up secret versioning and rollback
9. Implement emergency secret revocation
10. Add secret scanning in CI/CD
11. Document secret management procedures
12. Train team on secret handling

## Acceptance Criteria
- [ ] Secret management service deployed
- [ ] All secrets migrated from .env
- [ ] Automatic rotation configured
- [ ] Audit logging active
- [ ] Access policies implemented
- [ ] Secret scanning in CI/CD
- [ ] Emergency revocation procedure tested
- [ ] Team trained on procedures
- [ ] Documentation complete
- [ ] No secrets in code or logs

## Technical Considerations
- Use Vault for self-hosted, AWS Secrets Manager for cloud
- Implement secret caching with TTL
- Rotate secrets regularly (90 days)
- Use short-lived tokens where possible
- Monitor secret access patterns
- Implement break-glass procedures

## Files Affected
- `src/lib/secrets.ts` (new secret client)
- Environment variable loading
- CI/CD secret configuration
- Deployment scripts

## Testing Requirements
- Test secret rotation doesn't break app
- Test emergency revocation
- Test audit logging captures access
- Verify secrets not in code/logs
