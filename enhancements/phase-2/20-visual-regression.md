# 20 - Visual Regression Testing

**Priority:** 🟡 High
**Effort:** Medium (1-2 weeks)
**Impact:** Medium
**Dependencies:** 19-component-tests.md

## Problem
No visual regression testing. UI changes can break layout/design unnoticed. Manual testing is time-consuming and inconsistent. Cannot catch subtle CSS issues automatically.

## Requirements
1. Choose visual regression tool (Percy or Chromatic recommended)
2. Set up visual testing in CI/CD pipeline
3. Capture screenshots of all major pages and components
4. Test responsive breakpoints (mobile, tablet, desktop)
5. Test different themes/color schemes if applicable
6. Set up baseline snapshots
7. Configure acceptable diff thresholds
8. Implement review workflow for visual changes
9. Test across browsers (Chrome, Firefox, Safari)
10. Add visual tests for critical user flows
11. Integrate with PR workflow for approvals

## Acceptance Criteria
- [ ] Visual testing tool integrated (Percy/Chromatic)
- [ ] All major pages captured
- [ ] Critical components tested
- [ ] Responsive breakpoints covered
- [ ] Baselines established and committed
- [ ] CI/CD runs visual tests on PRs
- [ ] Review workflow documented
- [ ] Team trained on workflow
- [ ] Browser coverage configured

## Technical Considerations
- Percy integrates well with Playwright
- Chromatic designed for Storybook
- Consider cost (screenshots * builds)
- Ignore dynamic content (dates, random IDs)
- Use consistent test data
- Handle animations carefully

## Files Affected
- `.github/workflows/` (CI configuration)
- `tests/visual/**` (visual test specs)
- `percy.config.js` or `chromatic.config.js`

## Testing Requirements
- Visual tests run on every PR
- No false positives in detection
- Diff review process works smoothly
