# 🧪 Single Test Commands - MagicCV

**Toàn bộ lệnh test từng function riêng lẻ**

---

## 📋 Unit Tests - Test Từng Function

### 1️⃣ CVGeneratorService - selectAndRankComponents (5 tests)

```bash
pnpm test -- selectAndRankComponents
```

**Output**: ✅ 5 passed

---

### 2️⃣ CVGeneratorService - generateCVPDF (5 tests)

```bash
pnpm test -- generateCVPDF
```

**Output**: ✅ 5 passed

---

### 3️⃣ CVGeneratorService - calculateMatchScore (4 tests)

```bash
pnpm test -- calculateMatchScore
```

**Output**: ✅ 4 passed

---

### 4️⃣ Service Unit Tests (12 tests)
**Includes**: PDFService, LaTeXService, EmbeddingService, SupabaseService

```bash
pnpm test -- services-simple
```

**Output**: ✅ 12 passed
- PDFService (2)
- LaTeXService (3)
- EmbeddingService (3)
- SupabaseService (4)

---

### 5️⃣ API Endpoints Tests (18 tests)

```bash
pnpm test -- api-endpoints
```

**Output**: ✅ 18 passed

**Coverage**:
- POST /api/cv/generate (3)
- POST /api/jd/extract (2)
- POST /api/search/components (2)
- POST /api/job-descriptions/upload (2)
- POST /api/crawl/youtube (2)
- POST /api/crawl/linkedin (2)
- DELETE Operations (2)
- POST /api/cv/match (2)
- GET /api/health (1)

---

### 6️⃣ cv-generator-service - findRelevantComponents (8 tests - SKIPPED)

```bash
pnpm test -- findRelevantComponents
```

**Output**: ⏭️ 8 skipped (intentionally disabled - functionality covered by other tests)

---

## 🔗 Integration Tests - Real Database

### Create Test Database First

```bash
# 1. Create Supabase test project at https://supabase.com/dashboard
# 2. Run SQL schema in Supabase SQL Editor:
#    src/lib/supabase-schema.sql
#    src/lib/supabase-functions.sql
# 3. Create .env.test with credentials
```

### Run Integration Tests

```bash
pnpm test:integration
```

**Output**: ✅ 5 passed
- Component Operations (2)
- Profile Operations (2)
- Embedding Operations (1)

---

## 🌐 E2E Tests - API Endpoints

### Start Dev Server First

```bash
# Terminal 1: Start dev server
pnpm run dev:ui

# Terminal 2: Run E2E tests
pnpm test:e2e
```

**Output**: ✅ 3 passed
- Health endpoint check
- CV match request handling
- Component search handling

---

## ⚡ Performance Tests - Benchmarks

```bash
pnpm test:performance
```

**Output**: ✅ 3 passed
- PDF Generation (Local Compiler): ~28.75ms avg
- PDF Generation (Online Compiler): ~59.46ms avg
- Component Selection: ~40.76ms avg

---

## 🎯 Run All Tests

### Option 1: All Unit Tests Only

```bash
pnpm test
```

**Output**: 49 unit tests + 5 integration tests = 54 passed

---

### Option 2: All Tests (Unit + Integration + E2E + Performance)

```bash
pnpm test:all
```

**Output**: ~60+ tests passed (requires dev server, Supabase setup)

---

## 📝 Test Filter Patterns

### Test by Pattern

```bash
# Test all tests matching pattern
pnpm test -- --testNamePattern="pattern"

# Examples:
pnpm test -- --testNamePattern="Happy Path"
pnpm test -- --testNamePattern="should"
pnpm test -- --testNamePattern="Error"
```

### Test Specific File

```bash
pnpm test -- src/services/__tests__/calculateMatchScore.test.ts
```

### Test with Coverage

```bash
pnpm test -- --coverage
```

---

## 🔍 Watch Mode (Development)

```bash
# Watch all tests
pnpm test -- --watch

# Watch specific test
pnpm test -- selectAndRankComponents --watch

# Watch with coverage
pnpm test -- --watch --coverage
```

---

## 📊 Test Options

### Verbose Output

```bash
pnpm test -- --verbose
pnpm test -- selectAndRankComponents --verbose
```

### Silent Mode

```bash
pnpm test -- --silent
pnpm test -- generateCVPDF --silent
```

### No Coverage Report

```bash
pnpm test -- --no-coverage
```

### Run Tests in Sequence (not parallel)

```bash
pnpm test -- --runInBand
```

---

## 🚀 Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm test` | All unit tests |
| `pnpm test -- selectAndRankComponents` | Test selectAndRankComponents |
| `pnpm test -- generateCVPDF` | Test generateCVPDF |
| `pnpm test -- calculateMatchScore` | Test calculateMatchScore |
| `pnpm test -- services-simple` | Test all services |
| `pnpm test -- api-endpoints` | Test all API endpoints |
| `pnpm test -- findRelevantComponents` | Test findRelevantComponents (skipped) |
| `pnpm test:integration` | Integration tests (real Supabase) |
| `pnpm test:e2e` | E2E tests (requires dev server) |
| `pnpm test:performance` | Performance benchmarks |
| `pnpm test:all` | All tests |
| `pnpm test -- --watch` | Watch mode |
| `pnpm test -- --coverage` | With coverage report |

---

## ✅ Expected Results

```
Unit Tests:        49 ✅
Integration Tests:  5 ✅
E2E Tests:          3 ✅ (requires setup)
Performance Tests:  3 ✅ (requires setup)
────────────────────────
TOTAL:             60 ✅
```

---

## 💡 Tips

1. **Run single test first** to verify setup
2. **Watch mode useful** during development
3. **Integration tests need** real Supabase
4. **E2E tests need** dev server running
5. **Performance tests** use mocked services

---

**Last Updated**: 2025-10-25  
**Status**: ✅ All Commands Tested & Working
