# 🧪 API Endpoints Testing Guide

## Test Embedding Generation API

### GET /api/components/generate-embeddings
Get embedding stats

```bash
curl http://localhost:3000/api/components/generate-embeddings \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

Expected Response:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "withEmbedding": 5,
    "withoutEmbedding": 5,
    "percentage": 50
  }
}
```

### POST /api/components/generate-embeddings
Generate embeddings

```bash
curl -X POST http://localhost:3000/api/components/generate-embeddings \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"limit": 100, "batchSize": 5}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Successfully generated embeddings for X components",
  "results": {
    "total": 5,
    "successful": 5,
    "failed": 0,
    "errors": []
  }
}
```

---

## Test GitHub Crawl API

### POST /api/github/crawl
Crawl GitHub and create components

```bash
curl -X POST http://localhost:3000/api/github/crawl \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"githubUsername": "octocat", "includeReadme": true, "maxRepos": 50}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Successfully created X components from GitHub",
  "data": {
    "componentsCreated": 15,
    "profile": {
      "login": "octocat",
      "name": "The Octocat",
      ...
    },
    "errors": []
  }
}
```

---

## Common Issues

### 401 Unauthorized
- User not logged in
- Session expired
- Cookie not sent

**Fix:** Login at `/login` first

### 500 Internal Server Error
Possible causes:
1. Service import error
2. Supabase connection issue
3. Missing environment variables
4. Database schema mismatch

**Check:**
```bash
# Check logs
tail -f .next/server.log

# Check env vars
cat .env.local | grep SUPABASE
cat .env.local | grep GOOGLE
```

### Component Import Errors
If you see "Cannot find module" errors:

1. Check file exists:
```bash
ls src/services/component-embedding-service.ts
ls src/services/github-component-service.ts
```

2. Check imports in route files:
```typescript
// Should be:
import { ComponentEmbeddingService } from '@/services/component-embedding-service';
import { GitHubComponentService } from '@/services/github-component-service';
```

---

## Browser Console Testing

### Test Generate Embeddings Button

1. Open browser console (F12)
2. Go to `/library`
3. Click "Generate Embeddings" button
4. Watch console for errors

Expected console logs:
```
🚀 Starting embedding generation for user: <user_id>
📊 Processing X components in batches of 5...
✓ Generated embedding for component: <id> (<title>)
...
✅ Batch embedding generation complete!
   Total: X, Successful: X, Failed: 0
```

### Test GitHub Import Button

1. Open browser console (F12)
2. Go to `/library`
3. Click "Import from GitHub" button
4. Enter username (e.g., "octocat")
5. Click "Import Components"
6. Watch console for errors

Expected console logs:
```
🚀 Starting GitHub crawl for user <user_id>: octocat
🔍 Fetching comprehensive GitHub data for: octocat
📦 Found X repositories
✅ Fetched X repositories
✓ Created profile component
✓ Created project: repo1
✓ Created project: repo2
...
✓ Created skill: JavaScript
...
✅ Created X components total
```

---

## Debugging Steps

### Step 1: Check if API routes are registered

Visit in browser:
- http://localhost:3000/api/components/generate-embeddings
- http://localhost:3000/api/github/crawl

Should see either:
- JSON response with error (401 if not logged in) ✅ Route exists
- "Not Found" ❌ Route not registered

### Step 2: Check browser Network tab

1. Open DevTools → Network tab
2. Click button
3. Look for API request

**If no request:** Button onClick not working
**If 404:** API route not found
**If 401:** Not authenticated
**If 500:** Server error (check logs)

### Step 3: Check Next.js compilation

Look for errors in terminal where `pnpm run dev` is running:

```bash
# Good:
✓ Compiled /api/components/generate-embeddings in Xms

# Bad:
✗ Failed to compile
Module not found: Can't resolve '@/services/...'
```

### Step 4: Check service imports

```bash
# Check if services exist
ls -la src/services/component-embedding-service.ts
ls -la src/services/github-component-service.ts

# Check if they compile
cd src/services
npx tsc --noEmit component-embedding-service.ts
npx tsc --noEmit github-component-service.ts
```

---

## Quick Fixes

### Fix 1: Restart dev server
```bash
# Kill existing process
Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
pnpm run dev
```

### Fix 2: Reinstall dependencies
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Fix 3: Check TypeScript errors
```bash
pnpm run type-check
# or
npx tsc --noEmit
```

---

## Working Directory Structure

Should have:
```
src/
├── app/
│   └── api/
│       ├── components/
│       │   └── generate-embeddings/
│       │       └── route.ts ✓
│       └── github/
│           └── crawl/
│               └── route.ts ✓
├── services/
│   ├── component-embedding-service.ts ✓
│   ├── github-component-service.ts ✓
│   ├── embedding-service.ts ✓
│   └── supabase-service.ts ✓
└── components/
    ├── generate-embeddings-button.tsx ✓
    └── github-import-button.tsx ✓
```

---

**Last Updated:** 2025-10-31
