# CVGeneratorService - Comprehensive Unit Test Matrix

**Project**: MagicCV - AI-Powered CV Generator  
**Service**: CVGeneratorService  
**Total Test Cases**: 21  
**Coverage Target**: 90%+  
**Priority**: Critical Path Functions  
**Date**: October 25, 2025

---

## 📋 Table of Contents

1. [Test Matrix Overview](#test-matrix-overview)
2. [findRelevantComponents() - 8 Tests](#1️⃣-findrelevantcomponents---8-test-cases)
3. [selectAndRankComponents() - 5 Tests](#2️⃣-selectandrankcomponents---5-test-cases)
4. [generateCVPDF() - 5 Tests](#3️⃣-generatecvpdf---5-test-cases)
5. [calculateMatchScore() - 3 Tests](#4️⃣-calculatematchscore---3-test-cases)
6. [Test Coverage Summary](#-test-coverage-summary)
7. [Priority Execution Order](#-priority-execution-order)
8. [Assertion Patterns](#-assertion-patterns-used)
9. [Coverage Impact Analysis](#-coverage-impact-analysis)

---

## Test Matrix Overview

| Function | Test Cases | Happy Path | Edge Cases | Error Cases | Integration | Coverage Target |
|----------|-----------|-----------|-----------|------------|------------|-----------------|
| `findRelevantComponents()` | 8 | 2 | 3 | 2 | 1 | 90%+ |
| `selectAndRankComponents()` | 5 | 1 | 1 | 2 | 1 | 85%+ |
| `generateCVPDF()` | 5 | 2 | 1 | 2 | 0 | 80%+ |
| `calculateMatchScore()` | 3 | 1 | 1 | 0 | 1 | 95%+ |
| **TOTAL** | **21** | **6** | **6** | **6** | **3** | **88%+** |

---

## 1️⃣ `findRelevantComponents()` - 8 Test Cases

### Function Signature
```typescript
static async findRelevantComponents(
  userId: string,
  jobDescription: string,
  limit: number = 20
): Promise<Component[]>
```

### Purpose
Tìm kiếm components phù hợp với Job Description bằng vector similarity search với 3-level fallback mechanism.

### Test Matrix

| # | Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|---|----------|----------------------------|-------|-----------|-----------------|----------------|
| 1 | **Happy Path** | Given valid userId and non-empty JD, When findRelevantComponents called, Then returns relevant components sorted by similarity | `userId: "user_123"`<br>`jobDescription: "Python developer for AI team"`<br>`limit: 20` | ✅ `EmbeddingService.embed()` returns `[0.1, 0.2, ...]` (768-dim)<br>✅ `SupabaseService.similaritySearchComponents()` returns 5 components with similarity > 0.8 | `Component[]` with 5 items, each with `similarity` field sorted DESC | Array length, similarity order, component structure |
| 2 | **Happy Path** | Given valid userId and empty JD, When findRelevantComponents called, Then returns all user components as fallback | `userId: "user_123"`<br>`jobDescription: ""`<br>`limit: 20` | ✅ `SupabaseService.getUserComponents()` returns `{ components: [10 items], total: 10 }` | `Component[]` with up to 20 items | Array length ≤ limit, no embedding required |
| 3 | **Edge Case** | Given valid userId with zero components, When findRelevantComponents called, Then returns empty array without error | `userId: "user_456"`<br>`jobDescription: "Senior DevOps engineer"`<br>`limit: 20` | ✅ `SupabaseService.similaritySearchComponents()` returns `[]`<br>✅ `SupabaseService.getUserComponents()` returns `{ components: [], total: 0 }` | `Component[]` empty array `[]` | Array length === 0, no exception thrown |
| 4 | **Edge Case** | Given valid userId with limit=0, When findRelevantComponents called, Then returns empty array | `userId: "user_123"`<br>`jobDescription: "Product Manager"`<br>`limit: 0` | ✅ `SupabaseService.similaritySearchComponents()` with `limit: 0` returns `[]` | `Component[]` empty | Array length === 0 |
| 5 | **Edge Case** | Given very long jobDescription (>5000 chars), When findRelevantComponents called, Then processes and returns relevant components | `userId: "user_123"`<br>`jobDescription: "[LONG STRING 5000+ chars]"`<br>`limit: 20` | ✅ `EmbeddingService.embed()` handles long text, returns valid embedding<br>✅ `SupabaseService.similaritySearchComponents()` returns 3 components | `Component[]` with results | Array returned, no truncation errors |
| 6 | **Error Case** | Given invalid userId format, When findRelevantComponents called, Then catches error and falls back to getUserComponents | `userId: ""`<br>`jobDescription: "Backend Developer"`<br>`limit: 20` | ❌ `SupabaseService.similaritySearchComponents()` throws `Error("Invalid user_id")`<br>✅ Fallback: `SupabaseService.getUserComponents()` returns `{ components: [2 items], total: 2 }` | `Component[]` with 2 items from fallback | Fallback executed, console.warn logged, result from fallback |
| 7 | **Error Case** | Given embedding service failure, When findRelevantComponents called, Then falls back to all user components | `userId: "user_123"`<br>`jobDescription: "QA Engineer"`<br>`limit: 20` | ❌ `EmbeddingService.embed()` throws `Error("API rate limit exceeded")`<br>✅ Fallback: `SupabaseService.getUserComponents()` returns `{ components: [8 items], total: 8 }` | `Component[]` with 8 items | Error caught, fallback executed, console.error + console.warn logged |
| 8 | **Integration** | Given valid userId with mixed component types, When findRelevantComponents called with vector search success, Then returns only relevant components filtered and sorted | `userId: "user_123"`<br>`jobDescription: "Full Stack React + Node developer"`<br>`limit: 5` | ✅ `EmbeddingService.embed()` returns embedding<br>✅ `SupabaseService.similaritySearchComponents()` returns 5 components: 2 experiences (0.92, 0.87), 2 skills (0.85, 0.82), 1 project (0.80) | `Component[]` with 5 items in similarity DESC order | Exact order verification, relevance > 0.8, component type mix |

### Dependencies to Mock
- `EmbeddingService.embed()`
- `SupabaseService.similaritySearchComponents()`
- `SupabaseService.getUserComponents()`
- `console.log()`, `console.warn()`, `console.error()`

### Key Edge Cases
- Empty job description → Fallback to all user components
- Zero components in database → Return empty array
- Embedding service failure → Fallback mechanism
- Invalid user ID → Error handling and fallback

---

## 2️⃣ `selectAndRankComponents()` - 5 Test Cases

### Function Signature
```typescript
static async selectAndRankComponents(
  components: Component[],
  jobDescription: string,
  profile: Profile
): Promise<{
  experiences: any[];
  education: any[];
  skills: any;
  projects: any[];
}>
```

### Purpose
Sử dụng LLM (Google Generative AI) để chọn lọc và xếp hạng components theo độ phù hợp với Job Description.

### Test Matrix

| # | Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|---|----------|----------------------------|-------|-----------|-----------------|----------------|
| 1 | **Happy Path** | Given valid components array and JD, When selectAndRankComponents called, Then returns properly ranked components by LLM | `components: [5 items]`<br>`jobDescription: "Senior AI Engineer"`<br>`profile: { full_name: "John", profession: "Developer" }` | ✅ `GoogleGenerativeAI.getGenerativeModel()` returns mock model<br>✅ `model.generateContent()` returns valid JSON: `{ experiences: [3], education: [1], skills: {...}, projects: [2] }` | `{ experiences: [], education: [], skills: {}, projects: [] }` structure with ranked items | JSON structure valid, arrays sorted by relevance, all fields present |
| 2 | **Edge Case** | Given empty components array, When selectAndRankComponents called, Then LLM returns structure with empty arrays | `components: []`<br>`jobDescription: "Any JD"`<br>`profile: { full_name: null, profession: null }` | ✅ `model.generateContent()` called with 0 items in prompt<br>✅ Returns: `{ experiences: [], education: [], skills: {}, projects: [] }` | `{ experiences: [], education: [], skills: {}, projects: [] }` all empty | All arrays empty, structure valid |
| 3 | **Error Case** | Given LLM returns malformed JSON, When selectAndRankComponents called, Then catches parse error and throws | `components: [3 items]`<br>`jobDescription: "Manager Role"`<br>`profile: { full_name: "Jane", profession: "PM" }` | ❌ `model.generateContent()` returns: `"This is not JSON { invalid"` | `Error` thrown with message containing "parse" or "JSON" | Error caught, message logged, exception thrown |
| 4 | **Error Case** | Given LLM response with markdown formatting, When selectAndRankComponents called, Then strips markdown and parses JSON | `components: [4 items]`<br>`jobDescription: "DevOps"`<br>`profile: { full_name: "Bob", profession: "DevOps" }` | ✅ `model.generateContent()` returns: `` `\`\`json\n{...valid json...}\n\`\`\` `` | `{ experiences: [...], education: [...], skills: {...}, projects: [...] }` parsed | Markdown stripped, JSON extracted, structure valid |
| 5 | **Integration** | Given valid components with all types and profile missing some fields, When selectAndRankComponents called, Then LLM processes all and returns ranked result | `components: [10 mixed items]`<br>`jobDescription: "Full 2000-char JD with multiple skills"`<br>`profile: { full_name: undefined, profession: undefined }` | ✅ `model.generateContent()` called with `model: "gemini-2.0-flash-exp"`<br>✅ Returns complex nested JSON with ranked items | Properly structured result with all component types ranked | Profile fields default to "Not specified" in prompt, result valid |

### Dependencies to Mock
- `GoogleGenerativeAI` constructor
- `GoogleGenerativeAI.getGenerativeModel()`
- `GenerativeModel.generateContent()`
- `console.log()`, `console.error()`

### Key Edge Cases
- Empty components array → LLM should handle gracefully
- Malformed JSON response → Parse error handling
- Markdown-wrapped JSON → Strip formatting before parsing
- Missing profile fields → Default to "Not specified"

---

## 3️⃣ `generateCVPDF()` - 5 Test Cases

### Function Signature
```typescript
static async generateCVPDF(
  userId: string,
  jobDescription: string,
  options?: {
    includeProjects?: boolean;
    useOnlineCompiler?: boolean;
  }
): Promise<{
  pdfBuffer: Buffer;
  cvData: any;
}>
```

### Purpose
Tạo CV PDF hoàn chỉnh từ CV content sử dụng LaTeX compiler (local hoặc online).

### Test Matrix

| # | Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|---|----------|----------------------------|-------|-----------|-----------------|----------------|
| 1 | **Happy Path** | Given valid userId and JD using local compiler, When generateCVPDF called, Then returns PDF buffer and CV data | `userId: "user_123"`<br>`jobDescription: "Senior Developer"`<br>`options: { useOnlineCompiler: false }` | ✅ `this.generateCVContent()` returns valid CV object<br>✅ `LaTeXService.generatePDF()` returns Buffer with PDF binary | `{ pdfBuffer: Buffer, cvData: {...} }` | pdfBuffer is Buffer instance, cvData has all CV fields |
| 2 | **Happy Path** | Given valid userId and JD using online compiler, When generateCVPDF called, Then returns PDF buffer via online service | `userId: "user_123"`<br>`jobDescription: "Product Manager"`<br>`options: { useOnlineCompiler: true }` | ✅ `this.generateCVContent()` returns valid CV object<br>✅ `LaTeXService.renderTemplate()` returns LaTeX string<br>✅ `LaTeXService.generatePDFOnline()` returns PDF Buffer | `{ pdfBuffer: Buffer, cvData: {...} }` | pdfBuffer valid, used online compiler path (verify calls) |
| 3 | **Edge Case** | Given generateCVContent returns empty education/experience, When generateCVPDF called, Then still generates valid PDF with available content | `userId: "user_123"`<br>`jobDescription: "Entry-level role"`<br>`options: { includeProjects: true }` | ✅ `generateCVContent()` returns: `{ experience: [], education: [], skills: {...}, projects: [] }`<br>✅ `LaTeXService.generatePDF()` handles empty arrays gracefully | `{ pdfBuffer: Buffer, cvData: {...} }` | PDF generated despite empty sections |
| 4 | **Error Case** | Given generateCVContent fails, When generateCVPDF called, Then error propagates | `userId: "user_invalid"`<br>`jobDescription: "Any"`<br>`options: {}` | ❌ `this.generateCVContent()` throws `Error("Profile not found")` | `Error` thrown | Error message contains "Profile not found", exception propagates |
| 5 | **Error Case** | Given LaTeX compilation fails, When generateCVPDF called with local compiler, Then error caught and logged | `userId: "user_123"`<br>`jobDescription: "Developer"`<br>`options: { useOnlineCompiler: false }` | ✅ `generateCVContent()` succeeds<br>❌ `LaTeXService.generatePDF()` throws `Error("pdflatex not found")` | `Error` thrown | Error logged with ❌ prefix, pdflatex error message shown |

### Dependencies to Mock
- `CVGeneratorService.generateCVContent()`
- `LaTeXService.renderTemplate()`
- `LaTeXService.generatePDF()`
- `LaTeXService.generatePDFOnline()`
- `console.log()`, `console.error()`

### Key Edge Cases
- Local vs Online compiler paths → Different service calls
- Empty sections in CV → PDF should still generate
- LaTeX compilation failure → Error propagation
- Missing profile → generateCVContent fails first

---

## 4️⃣ `calculateMatchScore()` - 3 Test Cases

### Function Signature
```typescript
static async calculateMatchScore(
  userId: string,
  jobDescription: string
): Promise<{
  score: number;
  matches: {
    experience: number;
    education: number;
    skills: number;
  };
  suggestions: string[];
}>
```

### Purpose
Tính điểm phù hợp giữa CV và Job Description dựa trên số lượng components theo từng loại.

### Test Matrix

| # | Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|---|----------|----------------------------|-------|-----------|-----------------|----------------|
| 1 | **Happy Path** | Given userId with balanced component mix, When calculateMatchScore called, Then returns score with component breakdown | `userId: "user_123"`<br>`jobDescription: "Full Stack Developer"` | ✅ `findRelevantComponents()` returns 50 components: 8 experiences, 4 education, 25 skills, 13 projects | `{ score: number, matches: { experience, education, skills }, suggestions: string[] }` | Score between 0-100, experiences score = 80, education = 60, skills = 50, total ≤ 100 |
| 2 | **Edge Case** | Given userId with only skills (no experience/education), When calculateMatchScore called, Then returns score with suggestions for missing categories | `userId: "user_456"`<br>`jobDescription: "Data Scientist"` | ✅ `findRelevantComponents()` returns 30 components: 0 experiences, 0 education, 30 skills, 0 projects | `{ score: 60, matches: { experience: 0, education: 0, skills: 60 }, suggestions: ["Add more relevant work experience", "Add your education background"] }` | Score = 60, suggestions array has 2 items, specific messages present |
| 3 | **Integration** | Given userId with empty components list, When calculateMatchScore called, Then returns 0 score with all suggestions | `userId: "user_789"`<br>`jobDescription: "Any role"` | ✅ `findRelevantComponents()` returns `[]` | `{ score: 0, matches: { experience: 0, education: 0, skills: 0 }, suggestions: ["Add more relevant work experience", "Add more technical skills", "Add your education background"] }` | Score = 0, all 3 suggestions present, logic correct |

### Dependencies to Mock
- `CVGeneratorService.findRelevantComponents()`
- `console.log()`

### Key Edge Cases
- Balanced components → Normal scoring
- Missing component types → Suggestions provided
- Empty components → Score = 0 with all suggestions

---

## 📊 Test Coverage Summary

### Overall Statistics

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 21 |
| **Happy Path Tests** | 6 (28.6%) |
| **Edge Case Tests** | 6 (28.6%) |
| **Error Handling Tests** | 6 (28.6%) |
| **Integration Tests** | 3 (14.3%) |
| **Target Coverage** | 88%+ |

### Per-Function Breakdown

| Function | Total Cases | Happy Path | Edge Cases | Error Cases | Integration | Coverage Target |
|----------|------------|-----------|-----------|------------|------------|-----------------|
| `findRelevantComponents()` | 8 | 2 (25%) | 3 (37.5%) | 2 (25%) | 1 (12.5%) | 90%+ |
| `selectAndRankComponents()` | 5 | 1 (20%) | 1 (20%) | 2 (40%) | 1 (20%) | 85%+ |
| `generateCVPDF()` | 5 | 2 (40%) | 1 (20%) | 2 (40%) | 0 (0%) | 80%+ |
| `calculateMatchScore()` | 3 | 1 (33.3%) | 1 (33.3%) | 0 (0%) | 1 (33.3%) | 95%+ |
| **TOTAL** | **21** | **6** | **6** | **6** | **3** | **88%+** |

---

## 🎯 Priority Execution Order

### Phase 1️⃣: Critical Path (High Impact)
**Impact**: 80% of business value

```
Priority 1: findRelevantComponents() - 8 test cases
├─ Business Criticality: ⭐⭐⭐⭐⭐ (5/5)
├─ Complexity: ⭐⭐⭐⭐ (4/5)
├─ Coverage Impact: 50%
└─ Reason: Core search functionality with 3-level fallback mechanism

Priority 2: selectAndRankComponents() - 5 test cases
├─ Business Criticality: ⭐⭐⭐⭐⭐ (5/5)
├─ Complexity: ⭐⭐⭐⭐⭐ (5/5)
├─ Coverage Impact: 30%
└─ Reason: LLM integration, complex JSON parsing, ranking logic
```

**Estimated Time**: 45-60 minutes  
**Dependencies**: SupabaseService, EmbeddingService, GoogleGenerativeAI mocks

### Phase 2️⃣: Secondary Path (Medium Impact)
**Impact**: 20% of business value

```
Priority 3: generateCVPDF() - 5 test cases
├─ Business Criticality: ⭐⭐⭐⭐ (4/5)
├─ Complexity: ⭐⭐⭐⭐ (4/5)
├─ Coverage Impact: 15%
└─ Reason: Output generation, delegates to LaTeX services

Priority 4: calculateMatchScore() - 3 test cases
├─ Business Criticality: ⭐⭐⭐ (3/5)
├─ Complexity: ⭐⭐⭐ (3/5)
├─ Coverage Impact: 5%
└─ Reason: Scoring algorithm, simple logic, nice-to-have feature
```

**Estimated Time**: 30-40 minutes  
**Dependencies**: CVGeneratorService methods, LaTeXService mocks

---

## 🧪 Test Implementation Checklist

### Setup Phase
- [ ] Install test dependencies (`jest`, `@types/jest`, `ts-jest`)
- [ ] Configure `jest.config.js` for Next.js 15 + TypeScript
- [ ] Setup environment variables (`jest.setup.env.js`)
- [ ] Create global test utilities (`jest.setup.js`)
- [ ] Setup mock factories (Component, Profile, LLM responses)

### Mock Creation
- [ ] Create `SupabaseService` mock (13 methods)
- [ ] Create `EmbeddingService` mock (4 methods)
- [ ] Create `LaTeXService` mock (7 methods)
- [ ] Create `GoogleGenerativeAI` mock (full module mock)
- [ ] Setup mock data fixtures (50+ examples)

### Test Implementation
- [ ] Implement `findRelevantComponents()` tests (8 tests)
- [ ] Implement `selectAndRankComponents()` tests (5 tests)
- [ ] Implement `generateCVPDF()` tests (5 tests)
- [ ] Implement `calculateMatchScore()` tests (3 tests)

### Validation
- [ ] Run all 21 test cases
- [ ] Verify 100% pass rate
- [ ] Check code coverage > 88%
- [ ] Review console output for warnings
- [ ] Document any issues or edge cases found

### Documentation
- [ ] Document test data fixtures
- [ ] Add performance benchmarks
- [ ] Create troubleshooting guide
- [ ] Update README with test instructions

---

## 🔍 Assertion Patterns Used

### Jest Matchers

| Pattern | Usage | Example | When to Use |
|---------|-------|---------|-------------|
| **toEqual()** | Deep equality check | `expect(result).toEqual({...})` | Compare objects/arrays with same structure and values |
| **toHaveLength()** | Array/string length | `expect(array).toHaveLength(5)` | Verify array size or string length |
| **toThrow()** | Error throwing | `expect(() => fn()).toThrow()` | Test error handling and exceptions |
| **toHaveBeenCalled()** | Mock invocation | `expect(mockFn).toHaveBeenCalled()` | Verify mock was called at least once |
| **toHaveBeenCalledWith()** | Mock arguments | `expect(mockFn).toHaveBeenCalledWith(arg)` | Verify mock called with specific arguments |
| **toHaveBeenCalledTimes()** | Call count | `expect(mockFn).toHaveBeenCalledTimes(3)` | Verify exact number of mock calls |
| **toContain()** | Array membership | `expect(array).toContain(item)` | Check if array includes specific item |
| **toBeDefined()** | Not undefined | `expect(value).toBeDefined()` | Verify value is not undefined |
| **toBeNull()** | Null check | `expect(value).toBeNull()` | Verify value is exactly null |
| **toBeGreaterThan()** | Numeric comparison | `expect(score).toBeGreaterThan(0)` | Compare numbers (>, <, >=, <=) |
| **toBeInstanceOf()** | Type check | `expect(buffer).toBeInstanceOf(Buffer)` | Verify object is instance of class |
| **toMatchObject()** | Partial match | `expect(obj).toMatchObject({a: 1})` | Check if object contains subset of properties |

### Custom Assertions

```typescript
// Similarity score validation
expect(component.similarity).toBeGreaterThan(0.8);
expect(component.similarity).toBeLessThanOrEqual(1.0);

// Array order verification
expect(results[0].similarity).toBeGreaterThan(results[1].similarity);

// Component structure validation
expect(result).toMatchObject({
  id: expect.any(String),
  type: expect.stringMatching(/^(experience|education|skill|project)$/),
  title: expect.any(String)
});

// Console logging verification
expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Fallback'));
expect(console.error).toHaveBeenCalledTimes(1);
```

---

## ✅ Coverage Impact Analysis

### Coverage Distribution by Function

```
Total Coverage Target: 88%+

findRelevantComponents() = 50% of coverage
├─ Vector search happy path: 30%
│  └─ Embedding generation + similarity search
├─ Empty JD fallback path: 10%
│  └─ Direct getUserComponents call
└─ Error handling fallback: 10%
   └─ Embedding failure + Supabase error recovery

selectAndRankComponents() = 30% of coverage
├─ Happy path LLM integration: 15%
│  └─ Prompt generation + JSON parsing
├─ JSON parsing edge cases: 10%
│  └─ Malformed JSON + markdown stripping
└─ Empty components handling: 5%
   └─ Empty array processing

generateCVPDF() = 15% of coverage
├─ Local compiler path: 8%
│  └─ LaTeXService.generatePDF()
├─ Online compiler path: 5%
│  └─ LaTeXService.generatePDFOnline()
└─ Error handling: 2%
   └─ Compilation failures

calculateMatchScore() = 5% of coverage
└─ Scoring algorithm: 5%
   └─ Component counting + suggestion generation

Total: 100% ✅
```

### Critical Paths Coverage

| Path | Priority | Coverage % | Tests |
|------|----------|-----------|-------|
| **Vector Search Success** | 🔴 Critical | 30% | 3 tests |
| **LLM Ranking** | 🔴 Critical | 15% | 2 tests |
| **Fallback Mechanism** | 🟡 High | 20% | 4 tests |
| **Error Handling** | 🟡 High | 18% | 6 tests |
| **PDF Generation** | 🟢 Medium | 12% | 3 tests |
| **Scoring** | 🟢 Low | 5% | 3 tests |

---

## 🚀 Quick Start Guide

### 1. Run All Tests
```bash
pnpm test
```

### 2. Run Specific Function Tests
```bash
# findRelevantComponents tests
pnpm test findRelevantComponents

# selectAndRankComponents tests
pnpm test selectAndRankComponents

# generateCVPDF tests
pnpm test generateCVPDF

# calculateMatchScore tests
pnpm test calculateMatchScore
```

### 3. Run with Coverage
```bash
pnpm test:coverage
```

### 4. Watch Mode
```bash
pnpm test:watch
```

### 5. CI/CD Mode
```bash
pnpm test:ci
```

---

## 📝 Notes & Best Practices

### Test Naming Convention
- Use **Given-When-Then** pattern
- Be specific about input conditions
- Describe expected behavior clearly
- Example: "Given valid userId and non-empty JD, When findRelevantComponents called, Then returns relevant components sorted by similarity"

### Mock Strategy
- **Spy** for internal services (SupabaseService, EmbeddingService, LaTeXService)
- **Full module mock** for external SDKs (GoogleGenerativeAI)
- **Factory functions** for test data generation
- **Setup/teardown helpers** for mock lifecycle management

### Edge Cases to Test
- Empty inputs (empty strings, empty arrays, null values)
- Extreme values (very long strings, limit = 0, negative numbers)
- Error scenarios (API failures, timeouts, invalid data)
- Fallback mechanisms (3-level fallback in findRelevantComponents)
- Data format variations (JSON vs markdown-wrapped JSON)

### Performance Considerations
- Mock external API calls to avoid rate limits
- Use realistic but minimal test data
- Parallel test execution (Jest default)
- Timeout handling for slow operations (10s default)

---

**Document Version**: 1.0  
**Last Updated**: October 25, 2025  
**Maintained By**: MagicCV Testing Team  
**Status**: ✅ Complete and Ready for Implementation
