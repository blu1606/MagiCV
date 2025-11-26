# 51 - Batch CV Generation

**Priority:** 🔵 Low
**Effort:** Medium (2 weeks)
**Impact:** Medium
**Dependencies:** None

## Problem
Users can only generate one CV at a time. Job seekers applying to multiple positions must manually generate each CV. Time-consuming and repetitive.

## Requirements
1. Create batch generation UI (upload multiple JDs)
2. Support job description input methods (paste, file upload, URL)
3. Parse multiple job descriptions
4. Generate CVs for all JDs in parallel (with concurrency limits)
5. Show progress for batch operation
6. Allow cancellation of batch job
7. Download all CVs as ZIP file
8. Generate summary report (match scores, key requirements)
9. Handle failures gracefully (partial success)
10. Queue large batch jobs for background processing
11. Email notification when batch complete
12. Set batch size limits (e.g., max 10 at once)

## Acceptance Criteria
- [ ] Batch UI functional and intuitive
- [ ] Multiple JD input methods working
- [ ] Parallel generation with concurrency limits
- [ ] Progress indicator accurate
- [ ] Cancellation working
- [ ] ZIP download containing all CVs
- [ ] Summary report generated
- [ ] Partial failures handled
- [ ] Background processing for large batches
- [ ] Email notifications sent
- [ ] Batch size limits enforced

## Technical Considerations
- Use job queue (BullMQ, Inngest)
- Limit concurrent PDF generations
- Implement progress tracking in database
- Handle storage for batch results
- Set TTL for batch results (7 days)
- Monitor resource usage during batch
- Implement retry logic for failures

## Files Affected
- `src/app/(dashboard)/batch-generate/page.tsx` (new)
- `src/services/batch-cv-service.ts` (new)
- `src/app/api/cv/batch/route.ts` (new)
- Job queue configuration

## Testing Requirements
- Test with various batch sizes
- Test error handling (some fail)
- Test cancellation
- Load test batch generation
- Test email notifications
