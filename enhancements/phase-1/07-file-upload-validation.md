# 07 - File Upload Validation

**Priority:** 🔴 Critical
**Effort:** Medium (1 week)
**Impact:** High
**Dependencies:** 01-input-validation.md

## Problem
PDF upload endpoint exists without comprehensive validation. No file size limits, MIME type validation, virus scanning, or storage quotas. Vulnerable to malicious file uploads and storage abuse.

## Requirements
1. Validate file MIME types (whitelist: application/pdf, image/jpeg, image/png)
2. Enforce file size limits (10MB per file, 100MB per user total)
3. Verify file magic bytes match MIME type (prevent spoofing)
4. Implement per-user storage quotas
5. Scan files for viruses (ClamAV or cloud service)
6. Generate secure random filenames (prevent path traversal)
7. Store files in isolated directory with no execute permissions
8. Track upload counts per user per time period
9. Compress images before storage
10. Clean up abandoned uploads (temp files)

## Acceptance Criteria
- [ ] File size limits enforced (10MB per file)
- [ ] MIME types validated against whitelist
- [ ] Magic bytes verification prevents spoofing
- [ ] Storage quotas tracked per user (100MB)
- [ ] Virus scanning integration operational
- [ ] Filenames randomized and secure
- [ ] Upload rate limiting applied
- [ ] Temp files cleaned up automatically
- [ ] Penetration test confirms upload security

## Technical Considerations
- Use Supabase Storage or S3 with proper permissions
- Consider async virus scanning for UX
- Implement cleanup job for orphaned files
- Handle upload failures gracefully
- Monitor storage costs

## Files Affected
- `src/app/api/upload/**/route.ts` (add validation)
- `src/lib/file-validator.ts` (new)
- `src/lib/virus-scanner.ts` (new)

## Testing Requirements
- Test with malicious files (scripts, executables)
- Test file size limit enforcement
- Test storage quota enforcement
- Test MIME type spoofing attempts
