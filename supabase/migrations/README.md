# Database Migrations

This folder contains SQL migrations for the MagiCV database.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `20250105_add_hybrid_architecture.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project (first time only)
supabase link --project-ref your-project-ref

# Run pending migrations
supabase db push
```

### Option 3: pg Client (Advanced)

If you have direct database access:

```bash
psql postgres://[CONNECTION_STRING] -f supabase/migrations/20250105_add_hybrid_architecture.sql
```

## Current Migrations

### `20250105_add_hybrid_architecture.sql` - Solution A: Hybrid Architecture

**Purpose**: Implement category-based CV generation for complete, professional CVs

**Changes**:
1. **components table**:
   - Add `category` column: `'always-include' | 'match-required' | 'optional'`
   - Migrate existing data:
     - Education → `always-include`
     - Skills → `optional`
     - Experience/Projects → `match-required`

2. **profiles table**:
   - Add professional fields: `professional_title`, `summary`, `bio`
   - Add contact fields: `email`, `phone`, `location`, `linkedin_url`, `github_url`, `website_url`
   - Add skills fields: `soft_skills` (JSONB), `languages` (JSONB), `interests` (TEXT[])

3. **Helper functions**:
   - `get_components_by_category(user_id, category)`
   - `get_always_include_components(user_id)`
   - `update_component_category(component_id, new_category)`
   - `count_components_by_category(user_id)`

**Expected Outcome**:
- CV completeness improves from 10% → 85%
- Always includes profile, ALL education, comprehensive skills
- Still prioritizes JD-matched experiences and projects

## Rollback

To rollback this migration:

```sql
-- Remove category column
ALTER TABLE components DROP COLUMN IF EXISTS category;

-- Remove profile enhancements
ALTER TABLE profiles
  DROP COLUMN IF EXISTS professional_title,
  DROP COLUMN IF EXISTS summary,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS github_url,
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS soft_skills,
  DROP COLUMN IF EXISTS languages,
  DROP COLUMN IF EXISTS interests;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_components_by_category;
DROP FUNCTION IF EXISTS get_always_include_components;
DROP FUNCTION IF EXISTS update_component_category;
DROP FUNCTION IF EXISTS count_components_by_category;
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if category column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'components' AND column_name = 'category';

-- Check category distribution
SELECT category, COUNT(*) as count
FROM components
GROUP BY category;

-- Check profile enhancements
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('summary', 'soft_skills', 'languages');
```

## Troubleshooting

### Error: "column already exists"
The column was already added. Safe to ignore or use `IF NOT EXISTS` in ALTER statements.

### Error: "permission denied"
You need admin/service_role permissions to run migrations. Use the Supabase Dashboard SQL Editor or ensure your connection uses the service_role key.

### Error: "syntax error"
Check the SQL file for any typos or unsupported syntax. Try running statements one at a time to identify the problematic one.

## Next Steps

After running the migration:

1. **Update TypeScript types**: Already done in `src/lib/supabase.ts`
2. **Test profile service**: Use `ProfileService` methods
3. **Test CV generation**: Use `CVGeneratorService.generateCVPDFHybrid()`
4. **Update UI**: Add profile editor for new fields (optional)

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify environment variables are set correctly
3. Ensure you're using the service_role key for admin operations
4. Refer to Supabase docs: https://supabase.com/docs/guides/database
