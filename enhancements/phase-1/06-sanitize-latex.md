# 06 - Sanitize LaTeX Inputs

**Priority:** 🔴 Critical
**Effort:** Medium (1 week)
**Impact:** High
**Dependencies:** 01-input-validation.md

## Problem
User-provided content (job descriptions, experience text) is inserted directly into LaTeX templates without sanitization. Malicious LaTeX commands could execute arbitrary code during PDF compilation or cause denial of service.

## Requirements
1. Sanitize all user input before LaTeX insertion
2. Escape LaTeX special characters: \ { } $ & # ^ _ % ~
3. Use latex-escape library or create custom sanitizer
4. Whitelist safe formatting commands only
5. Strip potentially dangerous commands (\input, \write, \immediate)
6. Implement content length limits per field
7. Validate Unicode characters are LaTeX-compatible
8. Sanitize at service layer before template rendering
9. Add unit tests with malicious payloads

## Acceptance Criteria
- [ ] All user content sanitized before LaTeX compilation
- [ ] Special characters properly escaped
- [ ] Dangerous commands stripped
- [ ] Length limits enforced per field
- [ ] Unit tests with malicious LaTeX payloads pass
- [ ] Penetration test confirms no LaTeX injection
- [ ] Generated PDFs render correctly with special chars
- [ ] Performance impact < 50ms per CV

## Technical Considerations
- Use established sanitization library
- Consider caching sanitized content
- Handle edge cases (emoji, math symbols)
- Balance security with formatting preservation
- Test with various LaTeX compilers

## Files Affected
- `src/services/latex-service.ts` (add sanitization)
- `src/lib/latex-sanitizer.ts` (new)
- LaTeX templates (verify safe variable usage)

## Testing Requirements
- Unit tests with malicious payloads
- Integration tests with real compilation
- Verify formatting preserved for normal content
