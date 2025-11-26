# 48 - Complete User Profile Fields

**Priority:** 🔵 Low
**Effort:** Low (2-3 days)
**Impact:** Medium
**Dependencies:** None

## Problem
Profile table missing essential contact fields. CV generator uses hardcoded placeholders: phone='(000) 000-0000', address='123 Street', city_state_zip='City, State ZIP'. CVs look incomplete and unprofessional.

## Requirements
1. Add phone field to profiles table
2. Add address field to profiles table
3. Add city field to profiles table
4. Add state/province field
5. Add postal_code field
6. Add country field
7. Add LinkedIn URL field
8. Add portfolio/website URL field
9. Update profile form with new fields
10. Add validation for phone numbers (international formats)
11. Add validation for URLs
12. Update CV generator to use real data
13. Make fields optional but encourage completion

## Acceptance Criteria
- [ ] Database schema updated with new fields
- [ ] Migration created and tested
- [ ] Profile form includes all new fields
- [ ] Validation working for all field types
- [ ] CV generator uses real profile data
- [ ] No more hardcoded placeholder values
- [ ] Phone supports international formats
- [ ] URL fields validated
- [ ] Profile completion percentage shown
- [ ] User testing confirms usability

## Technical Considerations
- Use libphonenumber for phone validation
- Support multiple phone number formats
- Consider privacy (optional fields)
- Add profile completion prompts
- Migrate existing users gracefully

## Files Affected
- `supabase/migrations/` (schema update)
- `src/services/supabase-service.ts` (profile methods)
- Profile form components
- `src/services/cv-generator-service.ts` (use real data)

## Testing Requirements
- Test migration on staging data
- Test validation for all fields
- Verify CVs use real data
- Test international phone formats
