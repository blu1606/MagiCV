# 32 - Interactive User Onboarding

**Priority:** 🟡 High
**Effort:** High (2-3 weeks)
**Impact:** Medium
**Dependencies:** None

## Problem
Minimal onboarding page exists. No guided tour, no sample data, no contextual help. New users confused about features. High drop-off rate.

## Requirements
1. Create interactive product tour for new users
2. Implement step-by-step walkthrough of key features
3. Provide sample data for immediate experimentation
4. Add contextual help tooltips throughout app
5. Create video tutorials for complex features
6. Implement progress tracking (setup checklist)
7. Offer personalized onboarding based on user role
8. Allow users to skip or replay onboarding
9. Add in-app help center with searchable articles
10. Implement feature discovery (highlight new features)
11. Track onboarding completion and drop-off points
12. A/B test onboarding flows

## Acceptance Criteria
- [ ] Interactive tour implemented for new users
- [ ] Sample data pre-loaded for new accounts
- [ ] Contextual tooltips on key features
- [ ] Video tutorials embedded
- [ ] Setup checklist functional
- [ ] Help center searchable
- [ ] Onboarding can be skipped/replayed
- [ ] Analytics tracking onboarding metrics
- [ ] Mobile-friendly onboarding
- [ ] User testing shows improved comprehension

## Technical Considerations
- Use Intro.js or Shepherd.js for tour
- Store onboarding state in user profile
- Make skippable but encourage completion
- Keep steps short and focused
- Use real features, not simulations
- Track completion rates

## Files Affected
- `src/components/onboarding/*.tsx` (new)
- `src/lib/onboarding.ts` (tour logic)
- `src/app/(onboarding)/**` (onboarding pages)
- Database (onboarding_state table)

## Testing Requirements
- User testing with new users
- Track completion rates
- Test on mobile devices
- A/B test different flows
