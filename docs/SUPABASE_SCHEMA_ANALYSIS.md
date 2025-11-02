# 🔍 Supabase Schema Analysis
## So sánh Database Schema với Code

**Date:** Generated automatically  
**Status:** ⚠️ Có 2 issues cần fix

---

## ✅ CHECKS PASSED

### 1. Extensions
- ✅ **pgvector** extension: Đã cài đặt (version 0.8.0)
- ✅ **uuid-ossp** extension: Đã cài đặt

### 2. Tables Structure
Tất cả tables match với schema:

| Table | Status | Columns Match | Foreign Keys |
|-------|--------|---------------|--------------|
| `profiles` | ✅ | Yes | ✅ auth.users |
| `accounts` | ✅ | Yes | ✅ profiles |
| `components` | ✅ | Yes | ✅ profiles, accounts |
| `cvs` | ✅ | Yes | ✅ profiles |
| `cv_pdfs` | ✅ | Yes | ✅ profiles, cvs |

### 3. Functions
- ✅ **match_components**: Đã tồn tại và hoạt động đúng
- ⚠️ **match_cvs**: Đã tồn tại nhưng có **BUG** (xem Issues bên dưới)

### 4. Constraints
- ✅ **accounts**: Unique constraint `(provider, provider_account_id)` - Match với code
- ✅ Tất cả foreign keys đều đúng

---

## ⚠️ ISSUES FOUND

### Issue 1: Function `match_cvs` có BUG

**Problem:**
Function `match_cvs` đang JOIN với `components` table và dùng `c.embedding`, nhưng:
- `cvs` table **KHÔNG có** `embedding` column
- Logic này không đúng - function đang match CVs dựa trên component embeddings, không phải CV embeddings

**Current Function Logic (WRONG):**
```sql
FROM cvs cv
LEFT JOIN components c ON c.user_id = cv.user_id
WHERE 
    (user_id_param IS NULL OR cv.user_id = user_id_param)
    AND c.embedding IS NOT NULL  -- ❌ Wrong: using component embedding
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
```

**Expected Logic:**
- Option A: Thêm `embedding` column vào `cvs` table (recommended)
- Option B: Sửa function để match based on `job_description` text similarity
- Option C: Xóa function nếu không cần vector search cho CVs

**Fix Required:** 
1. Thêm `embedding vector(768)` column vào `cvs` table, HOẶC
2. Sửa lại function `match_cvs` với logic đúng

### Issue 2: Storage Bucket `cv_pdfs` - Chưa verify

**Problem:**
Code trong `supabase-service.ts` sử dụng storage bucket:
```typescript
static async uploadCVPdf(
    userId: string,
    filename: string,
    fileBuffer: Buffer
  ): Promise<{ path: string; url: string }> {
    const { data, error } = await this.supabase.storage
      .from('cv_pdfs')  // ❓ Bucket này có tồn tại không?
      .upload(path, fileBuffer, {...});
  }
```

**Action Required:**
- ✅ **Verify**: Storage bucket `cv_pdfs` có tồn tại trong Supabase Dashboard
- ✅ **Check**: Storage bucket có public access hoặc RLS policies đúng không

---

## 🔧 RECOMMENDED FIXES

### Fix 1: Sửa `match_cvs` Function

**Option A: Thêm embedding column vào cvs table** (Recommended)

```sql
-- Migration: Add embedding column to cvs table
ALTER TABLE cvs 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector search
CREATE INDEX IF NOT EXISTS cvs_embedding_idx 
ON cvs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Fix function match_cvs
CREATE OR REPLACE FUNCTION match_cvs(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  user_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  job_description text,
  match_score float,
  content jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.id,
    cv.user_id,
    cv.title,
    cv.job_description,
    cv.match_score,
    cv.content,
    cv.created_at,
    cv.updated_at,
    1 - (cv.embedding <=> query_embedding) AS similarity
  FROM cvs cv
  WHERE 
    (user_id_param IS NULL OR cv.user_id = user_id_param)
    AND cv.embedding IS NOT NULL
    AND 1 - (cv.embedding <=> query_embedding) > match_threshold
  ORDER BY cv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Option B: Remove function nếu không cần vector search cho CVs**

```sql
-- Nếu không cần vector search cho CVs, có thể xóa function
DROP FUNCTION IF EXISTS match_cvs;
```

### Fix 2: Verify Storage Bucket

**Manual Check Required:**
1. Vào Supabase Dashboard → Storage
2. Check xem bucket `cv_pdfs` có tồn tại không
3. Nếu chưa có, tạo bucket:
   - Name: `cv_pdfs`
   - Public: `false` (hoặc true nếu cần public access)
   - RLS: Enable Row Level Security
4. Set up RLS policies cho bucket nếu cần

---

## 📋 CHECKLIST

### Database Schema
- [x] ✅ All tables exist and match schema
- [x] ✅ All foreign keys correct
- [x] ✅ pgvector extension installed
- [x] ✅ match_components function works
- [ ] ⚠️ **Fix match_cvs function** (Issue 1)
- [ ] ⚠️ **Verify storage bucket cv_pdfs** (Issue 2)

### Code Compatibility
- [x] ✅ SupabaseService methods match table structure
- [x] ✅ All CRUD operations compatible
- [x] ✅ Vector search functions callable
- [ ] ⚠️ **Update code if cvs.embedding added** (if Fix 1 Option A chosen)

---

## 🚀 ACTION ITEMS

1. **URGENT**: Sửa function `match_cvs` - hiện tại có bug
   - Quyết định: Thêm embedding column vào cvs (Option A) hay xóa function (Option B)

2. **IMPORTANT**: Verify storage bucket `cv_pdfs`
   - Check trong Supabase Dashboard
   - Tạo bucket nếu chưa có
   - Set up RLS policies

3. **OPTIONAL**: Nếu thêm embedding column vào cvs:
   - Update TypeScript types trong `src/lib/supabase.ts`
   - Update CV interface để include embedding field
   - Update code generate embeddings cho job descriptions

---

## 📝 NOTES

- **Current State**: Schema cơ bản đã đúng, chỉ có 2 issues nhỏ
- **Impact**: 
  - Issue 1: Function `match_cvs` sẽ không hoạt động đúng nếu được gọi
  - Issue 2: Upload CV PDFs sẽ fail nếu bucket không tồn tại
- **Priority**: 
  - High: Fix match_cvs function
  - Medium: Verify storage bucket

