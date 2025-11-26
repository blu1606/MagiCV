# 52 - Admin Dashboard

**Priority:** 🔵 Low
**Effort:** High (3-4 weeks)
**Impact:** Medium
**Dependencies:** 33-user-analytics.md, 37-monitoring.md

## Requirements
1. Create protected admin area with role-based access
2. Build user management interface (view, edit, delete users)
3. Show system health metrics (API response times, error rates)
4. Display user analytics (signups, active users, retention)
5. Show CV generation statistics (total, success rate, avg time)
6. Implement feature flag management
7. Create API key management interface
8. Show real-time system logs with filtering
9. Build database query tool (read-only for safety)
10. Implement user impersonation for support
11. Create configuration management UI
12. Add audit log viewer
13. Show external service health (Google AI, Supabase)

## Acceptance Criteria
- [ ] Admin dashboard accessible to admin users only
- [ ] User management functional
- [ ] System metrics displayed accurately
- [ ] Analytics charts showing trends
- [ ] Feature flags manageable via UI
- [ ] API keys manageable
- [ ] Logs searchable and filterable
- [ ] User impersonation working securely
- [ ] Configuration editable via UI
- [ ] Audit logs complete and searchable
- [ ] External service status visible
- [ ] Mobile-friendly admin interface

## Technical Considerations
- Use shadcn/ui charts for visualizations
- Implement proper RBAC (admin, support, viewer roles)
- Log all admin actions for audit
- Rate limit admin endpoints
- Use read replicas for analytics queries
- Implement secure user impersonation
- Protect sensitive operations (delete, config changes)

## Files Affected
- `src/app/(admin)/**/*.tsx` (new admin pages)
- `src/lib/rbac.ts` (role-based access control)
- `src/services/admin-service.ts` (new)
- Database (admin roles, audit logs)

## Testing Requirements
- Test RBAC thoroughly
- Test all admin operations
- Verify audit logging
- Security testing of admin area
