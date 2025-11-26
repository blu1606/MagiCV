# 21 - Accessibility (a11y) Testing

**Priority:** 🟡 High
**Effort:** Medium (2 weeks)
**Impact:** High
**Dependencies:** 19-component-tests.md

## Problem
No accessibility testing. Components may have ARIA issues, keyboard navigation problems, or screen reader compatibility issues. Legal compliance risk (ADA, WCAG).

## Requirements
1. Set up jest-axe for automated a11y testing
2. Add a11y tests to all components
3. Test keyboard navigation comprehensively
4. Test screen reader compatibility
5. Test color contrast ratios
6. Test focus management
7. Verify ARIA labels and roles
8. Test forms with assistive technology
9. Achieve WCAG 2.1 AA compliance minimum
10. Generate accessibility audit reports
11. Fix all critical a11y violations

## Acceptance Criteria
- [ ] jest-axe integrated in all component tests
- [ ] Zero critical a11y violations
- [ ] Keyboard navigation functional everywhere
- [ ] All interactive elements have proper ARIA
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators visible
- [ ] Screen reader testing completed
- [ ] Accessibility audit report generated
- [ ] WCAG 2.1 AA compliance achieved

## Technical Considerations
- Use axe-core for automated testing
- Manual testing still required for some criteria
- Test with real screen readers (NVDA, JAWS, VoiceOver)
- Follow semantic HTML practices
- Use skip links for navigation
- Test with keyboard only (no mouse)

## Files Affected
- All component test files (add axe tests)
- `src/components/**/*.tsx` (fix violations)
- `jest.setup.js` (configure jest-axe)

## Testing Requirements
- All components pass axe tests
- Manual keyboard navigation testing
- Screen reader testing on major flows
