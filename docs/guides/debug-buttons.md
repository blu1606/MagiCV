# 🐛 Debug: Buttons Not Working

## Current Status
- ✅ Dev server running on http://localhost:3000
- ✅ Toaster added to layout.tsx
- ✅ API routes exist:
  - `/api/components/generate-embeddings`
  - `/api/github/crawl`
- ✅ Services created:
  - `component-embedding-service.ts`
  - `github-component-service.ts`
- ✅ Components created:
  - `GenerateEmbeddingsButton`
  - `GitHubImportButton`
- ✅ Buttons added to Library page

---

## Step-by-Step Debug Guide

### Step 1: Check Browser Console

1. Open http://localhost:3000/library
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Click "Generate Embeddings" button

**Look for errors like:**
- `useToast is not a function` → Toaster issue
- `fetch failed` → API issue
- `Cannot find module` → Import issue
- `Unauthorized` → Auth issue

### Step 2: Check Network Tab

1. Keep DevTools open
2. Go to "Network" tab
3. Click "Generate Embeddings" button
4. Look for request to `/api/components/generate-embeddings`

**Possible outcomes:**

| What you see | Meaning | Fix |
|---|---|---|
| No request appears | Button onClick not firing | Check button component |
| Request with 404 | API route not found | Check route file exists |
| Request with 401 | Not authenticated | Login first |
| Request with 500 | Server error | Check terminal logs |
| Request succeeds (200) | Button works! | Check response |

### Step 3: Check Terminal Logs

In the terminal where `pnpm run dev` is running, look for:

**When you click Generate Embeddings:**
```
🚀 Starting embedding generation for user: <user_id>
```

**When you click GitHub Import:**
```
🚀 Starting GitHub crawl for user <user_id>: <username>
```

**If you see compile errors:**
```
✗ Failed to compile
Module not found: Can't resolve '@/services/...'
```

---

## Common Issues & Solutions

### Issue 1: Dialog doesn't open

**Symptoms:**
- Click button
- Nothing happens
- No errors in console

**Possible causes:**
1. Button component not rendering
2. Dialog state not working
3. Event handler not attached

**Debug:**
```javascript
// Add console.log to button
<Button onClick={() => {
  console.log('Button clicked!'); // Add this
  setIsOpen(true);
}}>
  Generate Embeddings
</Button>
```

**Fix:**
- Check if button is actually the GenerateEmbeddingsButton component
- Check if Dialog component is imported correctly

---

### Issue 2: "useToast is not a function"

**Symptoms:**
- Error in console: `useToast is not a function`
- Dialog might open but can't show toasts

**Cause:**
- Toaster component not in layout
- Toast provider not set up

**Fix:**
✅ Already done! Toaster added to layout.tsx
- Restart dev server: Ctrl+C, then `pnpm run dev`

---

### Issue 3: API returns 401 Unauthorized

**Symptoms:**
- Request reaches API
- Returns 401 status
- Message: "Unauthorized"

**Cause:**
- User not logged in
- Session expired

**Fix:**
1. Go to `/login`
2. Log in with your account
3. Try button again

---

### Issue 4: API returns 500 Server Error

**Symptoms:**
- Request reaches API
- Returns 500 status
- Check terminal for error details

**Possible causes:**

**A. Import Error**
```
Error: Cannot find module '@/services/component-embedding-service'
```

Fix: Check file exists
```bash
ls src/services/component-embedding-service.ts
ls src/services/github-component-service.ts
```

**B. Supabase Error**
```
Error: Supabase client error
```

Fix: Check .env.local
```bash
cat .env.local | grep SUPABASE
```

**C. Missing Dependency**
```
Error: Cannot find module 'some-package'
```

Fix: Install dependency
```bash
pnpm install
```

---

### Issue 5: Button appears but is disabled

**Symptoms:**
- Button is gray/disabled
- Can't click it

**Causes:**

**For Generate Embeddings:**
- No components without embeddings
- Already generating (isLoading = true)

**For GitHub Import:**
- Username input is empty
- Already importing (isLoading = true)

**Fix:**
- Check button disabled condition:
```tsx
<Button
  disabled={!githubUsername.trim()} // This makes it disabled
  onClick={handleImport}
>
```

---

## Quick Checklist

Before asking for help, check:

- [ ] Dev server is running (`pnpm run dev`)
- [ ] No compile errors in terminal
- [ ] Can access http://localhost:3000/library
- [ ] Can see buttons on page
- [ ] Buttons are not disabled (not gray)
- [ ] Logged in (not seeing 401 errors)
- [ ] Browser console open (F12)
- [ ] Network tab open
- [ ] Tried clicking button
- [ ] Checked for errors in console
- [ ] Checked for API requests in Network tab
- [ ] Checked terminal logs

---

## If Still Not Working

### Collect this info:

1. **Browser console screenshot**
   - F12 → Console tab
   - Click button
   - Screenshot any errors

2. **Network tab screenshot**
   - F12 → Network tab
   - Click button
   - Screenshot the request/response

3. **Terminal output**
   - Copy last 50 lines from terminal
   - Include any error messages

4. **Which button?**
   - Generate Embeddings
   - Import from GitHub
   - Both

5. **What happens?**
   - Nothing (no dialog)
   - Dialog opens but then error
   - API call fails
   - Other

---

## Manual API Test

If buttons don't work, try calling API directly:

### Test Generate Embeddings

**In browser console (F12):**
```javascript
// Get stats
fetch('/api/components/generate-embeddings')
  .then(r => r.json())
  .then(console.log)

// Generate embeddings
fetch('/api/components/generate-embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 100, batchSize: 5 })
})
  .then(r => r.json())
  .then(console.log)
```

### Test GitHub Import

**In browser console:**
```javascript
fetch('/api/github/crawl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    githubUsername: 'octocat',
    includeReadme: true,
    maxRepos: 10
  })
})
  .then(r => r.json())
  .then(console.log)
```

If these work, problem is in button components.
If these fail, problem is in API routes.

---

**Last Updated:** 2025-10-31
**Status:** Awaiting user debug info
