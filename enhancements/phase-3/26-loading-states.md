# 26 - Loading States & Progress Indicators

**Priority:** 🟡 High
**Effort:** Medium (1-2 weeks)
**Impact:** High
**Dependencies:** None

## Problem
Dashboard has isGenerating state but many components lack loading indicators. Users don't know if app is working or frozen. Poor perceived performance and UX.

## Requirements
1. Add loading states to all async operations
2. Implement skeleton loaders for content areas
3. Show progress bars for long operations (CV generation)
4. Add spinners for quick operations (< 3 seconds)
5. Show percentage progress where calculable
6. Implement optimistic UI updates
7. Add loading state for image uploads
8. Show connection status indicators
9. Disable buttons during loading with visual feedback
10. Add loading states to navigation transitions
11. Implement shimmer effects for skeleton screens

## Acceptance Criteria
- [ ] All async operations have loading indicators
- [ ] Skeleton loaders on initial page loads
- [ ] Progress bars for CV generation
- [ ] Spinners for quick operations
- [ ] Buttons disabled with feedback during actions
- [ ] No "frozen" UI perception
- [ ] Smooth transitions between loading and loaded states
- [ ] Mobile loading states optimized
- [ ] Loading states accessible to screen readers
- [ ] User testing confirms improved perception

## Technical Considerations
- Use React Suspense for data fetching
- Implement loading state management (Zustand/Context)
- Avoid layout shift during loading
- Use CSS animations for smooth transitions
- Consider reduced motion preferences
- Test on slow connections (throttle network)

## Files Affected
- All async components (add loading states)
- `src/components/ui/skeleton.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/spinner.tsx`

## Testing Requirements
- Verify all async ops show loading
- Test on throttled network
- Test accessibility of loading states
