# 28 - Toast Notification System

**Priority:** 🟡 High
**Effort:** Low (2-3 days)
**Impact:** Medium
**Dependencies:** None

## Problem
No feedback system for background operations. Users unsure if actions succeeded. No success confirmations or error alerts. Poor communication of system state.

## Requirements
1. Integrate toast library (Sonner or react-hot-toast)
2. Show success toasts for completed actions
3. Show error toasts for failed operations
4. Show info toasts for important updates
5. Show warning toasts for cautionary messages
6. Support action buttons in toasts (undo, retry)
7. Configure appropriate durations (3s success, 5s error, persistent critical)
8. Position toasts appropriately (top-right default)
9. Stack multiple toasts gracefully
10. Make toasts dismissible by user
11. Add toast animations (slide in/out)
12. Ensure mobile responsiveness

## Acceptance Criteria
- [ ] Toast system integrated (Sonner/react-hot-toast)
- [ ] Success toasts on all successful actions
- [ ] Error toasts on all failures
- [ ] Action buttons functional (undo, retry)
- [ ] Appropriate durations configured
- [ ] Toasts stack without overlapping content
- [ ] Mobile-friendly positioning
- [ ] Accessible to screen readers
- [ ] Animations smooth and performant
- [ ] Consistent styling across app

## Technical Considerations
- Choose Sonner for better UX and features
- Use toast context/provider pattern
- Limit concurrent toasts (max 3)
- Consider toast position preferences
- Test with screen readers
- Respect reduced motion preferences

## Files Affected
- `src/components/ui/toaster.tsx` (new)
- `src/lib/toast.ts` (toast helpers)
- `src/app/layout.tsx` (add provider)
- Action handlers throughout app

## Testing Requirements
- Test all toast types display correctly
- Verify action buttons work
- Test accessibility
- Test mobile display
