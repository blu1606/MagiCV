# 50 - Multiple CV Templates

**Priority:** 🔵 Low
**Effort:** High (3-4 weeks)
**Impact:** High
**Dependencies:** None

## Problem
Only one LaTeX template exists (resume.tex.njk). Template selector UI exists but not functional. Users cannot customize CV appearance for different industries/roles.

## Requirements
1. Design 5 professional CV templates (Modern, Classic, Creative, Academic, Executive)
2. Create LaTeX templates for each design
3. Make template selector functional
4. Implement template preview system
5. Support template-specific customization
6. Ensure all templates support same data structure
7. Add template metadata (name, description, best for)
8. Test templates with various content lengths
9. Optimize templates for ATS compatibility
10. Allow users to save template preference
11. Support template switching for existing CVs
12. Ensure responsive PDF generation

## Acceptance Criteria
- [ ] 5 professional templates designed
- [ ] LaTeX templates created and tested
- [ ] Template selector functional
- [ ] Preview system working
- [ ] All templates render user data correctly
- [ ] Template switching working
- [ ] ATS compatibility verified
- [ ] User preference saved
- [ ] Templates handle edge cases (long text, missing data)
- [ ] User testing shows preference diversity

## Technical Considerations
- Use consistent LaTeX packages across templates
- Implement template inheritance for shared logic
- Consider PDF generation time per template
- Test with real user data
- Ensure accessibility in PDF output
- Handle template versioning

## Files Affected
- `src/templates/*.tex.njk` (new templates)
- `src/services/latex-service.ts` (template selection)
- Template selector UI components
- Database (user template preferences)

## Testing Requirements
- Test all templates with sample data
- Test with edge cases (very long/short content)
- ATS compatibility testing
- User preference testing
