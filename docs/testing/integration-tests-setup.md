# Integration Tests Setup Guide

## Overview

Integration tests use a **real Supabase database** to test database operations end-to-end. These tests will create and delete actual data in your test database.

## Prerequisites

1. A Supabase test project (or local Supabase instance)
2. Test database credentials
3. `.env.test` file configured

## Setup Steps

### 1. Create Test Supabase Project

**Option A: Use Supabase Cloud Test Project**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (e.g., `magicv-test`)
3. Note the Project URL and Service Role Key

**Option B: Use Local Supabase**
1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Run `supabase start` to start local instance
3. Use `http://localhost:54321` as URL
4. Get service role key from `supabase status`

### 2. Create `.env.test` File

Copy `.env.test.example` to `.env.test` and fill in values:

```bash
# Enable integration tests
ENABLE_INTEGRATION_TESTS=true

# Test Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# Optional: Google Generative AI (for tests that need it)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
```

**⚠️ Important:**
- Never commit `.env.test` to git (it's in `.gitignore`)
- Use a dedicated test database, not production
- Integration tests will create/delete data

### 3. Run Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run with coverage
pnpm test:integration -- --coverage
```

### 4. Verify Setup

Integration tests will:
1. Create test users in Supabase Auth
2. Create profiles, components, CVs in database
3. Test CRUD operations
4. Clean up all test data after completion

## Current Integration Tests

Located in `src/services/__tests__/integration/`:

1. **supabase.integration.test.ts** - Tests SupabaseService with real database:
   - Component CRUD operations
   - Profile operations  
   - Embedding similarity search (if SQL functions exist)

## Skipping Integration Tests

Integration tests are **automatically skipped** if:
- `ENABLE_INTEGRATION_TESTS` is not set to `'true'`
- `.env.test` file doesn't exist
- Supabase credentials are missing

## Troubleshooting

### "Missing test Supabase credentials"
- Ensure `.env.test` exists and has correct values
- Check that `ENABLE_INTEGRATION_TESTS=true` is set

### "Integration tests require real Supabase credentials"
- You're using mock values, need actual Supabase project credentials
- Update `.env.test` with real Supabase URL and keys

### "Database connection failed"
- Verify Supabase project is running
- Check network connectivity
- Verify service role key has correct permissions

### "Test user creation failed"
- Ensure Supabase Auth is enabled
- Check service role key permissions
- Verify database schema is set up correctly

## Best Practices

1. **Use Separate Test Database**: Never use production database
2. **Clean Up**: Tests auto-cleanup, but monitor for orphaned data
3. **CI/CD**: Use environment variables in CI, not `.env.test` file
4. **Rate Limiting**: Be aware of Supabase rate limits during testing

