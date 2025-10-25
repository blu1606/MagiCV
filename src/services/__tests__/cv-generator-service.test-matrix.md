# CVGeneratorService - Comprehensive Unit Test Matrix

**Total Test Cases:** 21  
**Coverage Target:** 90%+  
**Priority:** Critical Path Functions  

---

## 1️⃣ `findRelevantComponents()` - 8 Test Cases

### Test Matrix

| Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|----------|----------------------------|-------|-----------|-----------------|----------------|
| **Happy Path** | Given valid userId and non-empty JD, When findRelevantComponents called, Then returns relevant components sorted by similarity | `userId: "user_123"`, `jobDescription: "Python developer for AI team"`, `limit: 20` | ✅ `EmbeddingService.embed()` returns `[0.1, 0.2, ...]` (768-dim)<br>✅ `SupabaseService.similaritySearchComponents()` returns 5 components with similarity > 0.8 | `Component[]` with 5 items, each with `similarity` field sorted DESC | Array length, similarity order, component structure |
| **Happy Path** | Given valid userId and empty JD, When findRelevantComponents called, Then returns all user components as fallback | `userId: "user_123"`, `jobDescription: ""`, `limit: 20` | ✅ `SupabaseService.getUserComponents()` returns `{ components: [10 items], total: 10 }` | `Component[]` with up to 20 items | Array length ≤ limit, no embedding required |
| **Edge Case** | Given valid userId with zero components, When findRelevantComponents called, Then returns empty array without error | `userId: "user_456"`, `jobDescription: "Senior DevOps engineer"`, `limit: 20` | ✅ `SupabaseService.similaritySearchComponents()` returns `[]`<br>✅ `SupabaseService.getUserComponents()` returns `{ components: [], total: 0 }` | `Component[]` empty array `[]` | Array length === 0, no exception thrown |
| **Edge Case** | Given valid userId with limit=0, When findRelevantComponents called, Then returns empty array | `userId: "user_123"`, `jobDescription: "Product Manager"`, `limit: 0` | ✅ `SupabaseService.similaritySearchComponents()` with `limit: 0` returns `[]` | `Component[]` empty | Array length === 0 |
| **Edge Case** | Given very long jobDescription (>5000 chars), When findRelevantComponents called, Then processes and returns relevant components | `userId: "user_123"`, `jobDescription: "[LONG STRING 5000+ chars]"`, `limit: 20` | ✅ `EmbeddingService.embed()` handles long text, returns valid embedding<br>✅ `SupabaseService.similaritySearchComponents()` returns 3 components | `Component[]` with results | Array returned, no truncation errors |
| **Error Case** | Given invalid userId format, When findRelevantComponents called, Then catches error and falls back to getUserComponents | `userId: ""`, `jobDescription: "Backend Developer"`, `limit: 20` | ❌ `SupabaseService.similaritySearchComponents()` throws `Error("Invalid user_id")`<br>✅ Fallback: `SupabaseService.getUserComponents()` returns `{ components: [2 items], total: 2 }` | `Component[]` with 2 items from fallback | Fallback executed, console.warn logged, result from fallback |
| **Error Case** | Given embedding service failure, When findRelevantComponents called, Then falls back to all user components | `userId: "user_123"`, `jobDescription: "QA Engineer"`, `limit: 20` | ❌ `EmbeddingService.embed()` throws `Error("API rate limit exceeded")`<br>✅ Fallback: `SupabaseService.getUserComponents()` returns `{ components: [8 items], total: 8 }` | `Component[]` with 8 items | Error caught, fallback executed, console.error + console.warn logged |
| **Integration** | Given valid userId with mixed component types, When findRelevantComponents called with vector search success, Then returns only relevant components filtered and sorted | `userId: "user_123"`, `jobDescription: "Full Stack React + Node developer"`, `limit: 5` | ✅ `EmbeddingService.embed()` returns embedding<br>✅ `SupabaseService.similaritySearchComponents()` returns 5 components: 2 experiences (0.92, 0.87), 2 skills (0.85, 0.82), 1 project (0.80) | `Component[]` with 5 items in similarity DESC order | Exact order verification, relevance > 0.8, component type mix |

---

## 2️⃣ `selectAndRankComponents()` - 5 Test Cases

### Test Matrix

| Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|----------|----------------------------|-------|-----------|-----------------|----------------|
| **Happy Path** | Given valid components array and JD, When selectAndRankComponents called, Then returns properly ranked components by LLM | `components: [5 items]`, `jobDescription: "Senior AI Engineer"`, `profile: { full_name: "John", profession: "Developer" }` | ✅ `GoogleGenerativeAI.getGenerativeModel()` returns mock model<br>✅ `model.generateContent()` returns valid JSON: `{ experiences: [3], education: [1], skills: {...}, projects: [2] }` | `{ experiences: [], education: [], skills: {}, projects: [] }` structure with ranked items | JSON structure valid, arrays sorted by relevance, all fields present |
| **Edge Case** | Given empty components array, When selectAndRankComponents called, Then LLM returns structure with empty arrays | `components: []`, `jobDescription: "Any JD"`, `profile: { full_name: null, profession: null }` | ✅ `model.generateContent()` called with 0 items in prompt<br>✅ Returns: `{ experiences: [], education: [], skills: {}, projects: [] }` | `{ experiences: [], education: [], skills: {}, projects: [] }` all empty | All arrays empty, structure valid |
| **Error Case** | Given LLM returns malformed JSON, When selectAndRankComponents called, Then catches parse error and throws | `components: [3 items]`, `jobDescription: "Manager Role"`, `profile: { full_name: "Jane", profession: "PM" }` | ❌ `model.generateContent()` returns: `"This is not JSON { invalid"` | `Error` thrown with message containing "parse" or "JSON" | Error caught, message logged, exception thrown |
| **Error Case** | Given LLM response with markdown formatting, When selectAndRankComponents called, Then strips markdown and parses JSON | `components: [4 items]`, `jobDescription: "DevOps"`, `profile: { full_name: "Bob", profession: "DevOps" }` | ✅ `model.generateContent()` returns: `` `\`\`json\n{...valid json...}\n\`\`\` `` | `{ experiences: [...], education: [...], skills: {...}, projects: [...] }` parsed | Markdown stripped, JSON extracted, structure valid |
| **Integration** | Given valid components with all types and profile missing some fields, When selectAndRankComponents called, Then LLM processes all and returns ranked result | `components: [10 mixed items]`, `jobDescription: "Full 2000-char JD with multiple skills"`, `profile: { full_name: undefined, profession: undefined }` | ✅ `model.generateContent()` called with `model: "gemini-2.0-flash-exp"`<br>✅ Returns complex nested JSON with ranked items | Properly structured result with all component types ranked | Profile fields default to "Not specified" in prompt, result valid |

---

## 3️⃣ `generateCVPDF()` - 5 Test Cases

### Test Matrix

| Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|----------|----------------------------|-------|-----------|-----------------|----------------|
| **Happy Path** | Given valid userId and JD using local compiler, When generateCVPDF called, Then returns PDF buffer and CV data | `userId: "user_123"`, `jobDescription: "Senior Developer"`, `options: { useOnlineCompiler: false }` | ✅ `this.generateCVContent()` returns valid CV object<br>✅ `LaTeXService.generatePDF()` returns Buffer with PDF binary | `{ pdfBuffer: Buffer, cvData: {...} }` | pdfBuffer is Buffer instance, cvData has all CV fields |
| **Happy Path** | Given valid userId and JD using online compiler, When generateCVPDF called, Then returns PDF buffer via online service | `userId: "user_123"`, `jobDescription: "Product Manager"`, `options: { useOnlineCompiler: true }` | ✅ `this.generateCVContent()` returns valid CV object<br>✅ `LaTeXService.renderTemplate()` returns LaTeX string<br>✅ `LaTeXService.generatePDFOnline()` returns PDF Buffer | `{ pdfBuffer: Buffer, cvData: {...} }` | pdfBuffer valid, used online compiler path (verify calls) |
| **Edge Case** | Given generateCVContent returns empty education/experience, When generateCVPDF called, Then still generates valid PDF with available content | `userId: "user_123"`, `jobDescription: "Entry-level role"`, `options: { includeProjects: true }` | ✅ `generateCVContent()` returns: `{ experience: [], education: [], skills: {...}, projects: [] }`<br>✅ `LaTeXService.generatePDF()` handles empty arrays gracefully | `{ pdfBuffer: Buffer, cvData: {...} }` | PDF generated despite empty sections |
| **Error Case** | Given generateCVContent fails, When generateCVPDF called, Then error propagates | `userId: "user_invalid"`, `jobDescription: "Any"`, `options: {}` | ❌ `this.generateCVContent()` throws `Error("Profile not found")` | `Error` thrown | Error message contains "Profile not found", exception propagates |
| **Error Case** | Given LaTeX compilation fails, When generateCVPDF called with local compiler, Then error caught and logged | `userId: "user_123"`, `jobDescription: "Developer"`, `options: { useOnlineCompiler: false }` | ✅ `generateCVContent()` succeeds<br>❌ `LaTeXService.generatePDF()` throws `Error("pdflatex not found")` | `Error` thrown | Error logged with ❌ prefix, pdflatex error message shown |

---

## 4️⃣ `calculateMatchScore()` - 3 Test Cases

### Test Matrix

| Category | Test Name (Given-When-Then) | Input | Mock Setup | Expected Output | Assertion Type |
|----------|----------------------------|-------|-----------|-----------------|----------------|
| **Happy Path** | Given userId with balanced component mix, When calculateMatchScore called, Then returns score with component breakdown | `userId: "user_123"`, `jobDescription: "Full Stack Developer"` | ✅ `findRelevantComponents()` returns 50 components: 8 experiences, 4 education, 25 skills, 13 projects | `{ score: number, matches: { experience, education, skills }, suggestions: string[] }` | Score between 0-100, experiences score = 80, education = 60, skills = 50, total ≤ 100 |
| **Edge Case** | Given userId with only skills (no experience/education), When calculateMatchScore called, Then returns score with suggestions for missing categories | `userId: "user_456"`, `jobDescription: "Data Scientist"` | ✅ `findRelevantComponents()` returns 30 components: 0 experiences, 0 education, 30 skills, 0 projects | `{ score: 60, matches: { experience: 0, education: 0, skills: 60 }, suggestions: ["Add more relevant work experience", "Add your education background"] }` | Score = 60, suggestions array has 2 items, specific messages present |
| **Integration** | Given userId with empty components list, When calculateMatchScore called, Then returns 0 score with all suggestions | `userId: "user_789"`, `jobDescription: "Any role"` | ✅ `findRelevantComponents()` returns `[]` | `{ score: 0, matches: { experience: 0, education: 0, skills: 0 }, suggestions: ["Add more relevant work experience", "Add more technical skills", "Add your education background"] }` | Score = 0, all 3 suggestions present, logic correct |

---

## 📊 Test Coverage Summary

| Function | Total Cases | Happy Path | Edge Cases | Error Cases | Integration | Coverage Target |
|----------|------------|-----------|-----------|------------|------------|-----------------|
| `findRelevantComponents()` | 8 | 2 | 3 | 2 | 1 | 90%+ |
| `selectAndRankComponents()` | 5 | 1 | 1 | 2 | 1 | 85%+ |
| `generateCVPDF()` | 5 | 2 | 1 | 2 | 0 | 80%+ |
| `calculateMatchScore()` | 3 | 1 | 1 | 0 | 1 | 95%+ |
| **TOTAL** | **21** | **6** | **6** | **6** | **3** | **88%+ |

---

## 🎯 Priority Execution Order

### Phase 1️⃣: Critical Path (High Impact)
```
1. findRelevantComponents() - 8 cases (50% coverage impact)
   └─ Reason: Core search, 3-level fallback complexity
2. selectAndRankComponents() - 5 cases (30% coverage impact)
   └─ Reason: LLM integration, parsing complexity
```

### Phase 2️⃣: Secondary Path (Medium Impact)
```
3. generateCVPDF() - 5 cases (15% coverage impact)
   └─ Reason: Output generation, delegates to services
4. calculateMatchScore() - 3 cases (5% coverage impact)
   └─ Reason: Scoring algorithm, simple logic
```

---

## 🧪 Test Implementation Checklist

- [ ] Setup mock factories (Component, Profile, LLM responses)
- [ ] Configure beforeEach hooks (mock reset, env setup)
- [ ] Implement findRelevantComponents() tests
- [ ] Implement selectAndRankComponents() tests
- [ ] Implement generateCVPDF() tests
- [ ] Implement calculateMatchScore() tests
- [ ] Verify all 21 test cases pass
- [ ] Check code coverage > 88%
- [ ] Document test data fixtures
- [ ] Add performance benchmarks

---

## 🔍 Assertion Patterns Used

| Pattern | Usage | Example |
|---------|-------|---------|
| **toEqual()** | Exact matching | `expect(result).toEqual([...])` |
| **toHaveLength()** | Array/string length | `expect(result).toHaveLength(5)` |
| **toThrow()** | Error throwing | `expect(() => fn()).toThrow()` |
| **toHaveBeenCalled()** | Mock called | `expect(mockFn).toHaveBeenCalled()` |
| **toHaveBeenCalledWith()** | Mock args | `expect(mockFn).toHaveBeenCalledWith(arg)` |
| **toContain()** | Array contains | `expect(result).toContain(item)` |
| **toBeDefined()** | Not undefined | `expect(result).toBeDefined()` |
| **toBeGreaterThan()** | Numeric | `expect(score).toBeGreaterThan(0)` |

---

## ✅ Coverage Impact Analysis

```
findRelevantComponents() = 50%
├─ Vector search path: 30%
├─ Empty JD fallback: 10%
└─ Error fallback: 10%

selectAndRankComponents() = 30%
├─ Happy path: 15%
├─ JSON parsing: 10%
└─ Markdown handling: 5%

generateCVPDF() = 15%
├─ Local compiler: 8%
├─ Online compiler: 5%
└─ Error handling: 2%

calculateMatchScore() = 5%
└─ Scoring algorithm: 5%

Total: 100% ✅
```
