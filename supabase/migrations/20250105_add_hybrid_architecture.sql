-- Migration: Add Hybrid Architecture Support
-- Solution A: Category-based CV generation
-- Date: 2025-01-05
-- Description: Add category column to components and enhanced profile fields

-- ============================================================================
-- PART 1: Add category column to components table
-- ============================================================================

-- Add category column with check constraint
ALTER TABLE components
ADD COLUMN IF NOT EXISTS category TEXT
DEFAULT 'match-required'
CHECK (category IN ('always-include', 'match-required', 'optional'));

-- Add index for fast category queries
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_user_category ON components(user_id, category);

-- Migrate existing data to appropriate categories
-- Education: Always include (never filter out)
UPDATE components
SET category = 'always-include'
WHERE type = 'education' AND category = 'match-required';

-- Skills: Optional (include all, prioritize matched)
UPDATE components
SET category = 'optional'
WHERE type = 'skill' AND category = 'match-required';

-- Experience & Projects: Match-required (only include if matches JD)
UPDATE components
SET category = 'match-required'
WHERE type IN ('experience', 'project') AND category = 'match-required';

COMMENT ON COLUMN components.category IS 'always-include: Always in CV (education), match-required: Only if matches JD (experience, project), optional: All included but matched first (skills)';

-- ============================================================================
-- PART 2: Enhance profiles table with additional fields
-- ============================================================================

-- Add professional summary
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add contact information
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add soft skills and languages (JSONB arrays)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS soft_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Add indexes for JSONB columns (GIN indexes for fast queries)
CREATE INDEX IF NOT EXISTS idx_profiles_soft_skills ON profiles USING gin(soft_skills);
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING gin(languages);

-- Add comments for documentation
COMMENT ON COLUMN profiles.professional_title IS 'Professional title (e.g., "Senior Software Engineer")';
COMMENT ON COLUMN profiles.summary IS 'Professional summary (2-3 sentences)';
COMMENT ON COLUMN profiles.soft_skills IS 'Array of soft skill names, e.g., ["Leadership", "Communication", "Problem Solving"]';
COMMENT ON COLUMN profiles.languages IS 'Array of language objects, e.g., [{"name": "English", "level": "Native"}, {"name": "Spanish", "level": "Intermediate"}]';
COMMENT ON COLUMN profiles.interests IS 'Array of interests/hobbies, e.g., ["Open Source", "Hiking", "Photography"]';

-- ============================================================================
-- PART 3: Update RLS policies (if needed)
-- ============================================================================

-- Ensure users can read/update their own enhanced profile fields
-- Note: Existing RLS policies should already cover these columns
-- This is just a safety check

DO $$
BEGIN
  -- Check if RLS is enabled on profiles table
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'profiles'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- PART 4: Helper functions for category management
-- ============================================================================

-- Function to get components by category
CREATE OR REPLACE FUNCTION get_components_by_category(
  user_id_param uuid,
  category_param text
)
RETURNS SETOF components
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM components
  WHERE user_id = user_id_param
    AND category = category_param
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION get_components_by_category IS 'Get all components for a user filtered by category';

-- Function to get always-include components (for CV generation)
CREATE OR REPLACE FUNCTION get_always_include_components(user_id_param uuid)
RETURNS SETOF components
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM components
  WHERE user_id = user_id_param
    AND category = 'always-include'
  ORDER BY
    CASE type
      WHEN 'education' THEN 1
      ELSE 2
    END,
    created_at DESC;
$$;

COMMENT ON FUNCTION get_always_include_components IS 'Get all always-include components (education, etc.) for CV generation';

-- Function to update component category
CREATE OR REPLACE FUNCTION update_component_category(
  component_id_param uuid,
  new_category text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate category
  IF new_category NOT IN ('always-include', 'match-required', 'optional') THEN
    RAISE EXCEPTION 'Invalid category: %. Must be one of: always-include, match-required, optional', new_category;
  END IF;

  -- Update category
  UPDATE components
  SET
    category = new_category,
    updated_at = NOW()
  WHERE id = component_id_param;
END;
$$;

COMMENT ON FUNCTION update_component_category IS 'Update the category of a component with validation';

-- ============================================================================
-- PART 5: Data validation queries
-- ============================================================================

-- Count components by category (for verification)
CREATE OR REPLACE FUNCTION count_components_by_category(user_id_param uuid)
RETURNS TABLE (
  category text,
  count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    category,
    COUNT(*) as count
  FROM components
  WHERE user_id = user_id_param
  GROUP BY category
  ORDER BY
    CASE category
      WHEN 'always-include' THEN 1
      WHEN 'match-required' THEN 2
      WHEN 'optional' THEN 3
      ELSE 4
    END;
$$;

COMMENT ON FUNCTION count_components_by_category IS 'Count components by category for a user';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if migration was successful
DO $$
DECLARE
  category_exists boolean;
  profile_fields_exist boolean;
BEGIN
  -- Check if category column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'components'
    AND column_name = 'category'
  ) INTO category_exists;

  -- Check if profile fields exist
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name IN ('summary', 'soft_skills', 'languages')
    GROUP BY table_name
    HAVING COUNT(*) = 3
  ) INTO profile_fields_exist;

  IF category_exists AND profile_fields_exist THEN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   - category column added to components';
    RAISE NOTICE '   - Enhanced profile fields added';
    RAISE NOTICE '   - Helper functions created';
  ELSE
    RAISE WARNING '⚠️ Migration may be incomplete. Please check manually.';
  END IF;
END $$;
