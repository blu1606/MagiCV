-- Migration: Add Missing Profile Contact Fields
-- Date: 2025-01-06
-- Description: Add address, city, state, zip, country, and portfolio_url fields to profiles table
-- This complements the existing fields from 20250105_add_hybrid_architecture.sql

-- Add missing contact fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Vietnam',
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Update existing rows to have default country if not set
UPDATE profiles SET country = 'Vietnam' WHERE country IS NULL;

-- Add index for faster lookups (if not already exists from previous migration)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.address IS 'Street address';
COMMENT ON COLUMN profiles.city IS 'City name';
COMMENT ON COLUMN profiles.state IS 'State/Province name';
COMMENT ON COLUMN profiles.zip IS 'ZIP/Postal code';
COMMENT ON COLUMN profiles.country IS 'Country name (default: Vietnam)';
COMMENT ON COLUMN profiles.portfolio_url IS 'Portfolio website URL';

-- Verification
DO $$
BEGIN
  -- Check if all columns exist
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name IN ('address', 'city', 'state', 'zip', 'country', 'portfolio_url')
    GROUP BY table_name
    HAVING COUNT(*) = 6
  ) THEN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   - Added address, city, state, zip, country, portfolio_url columns';
  ELSE
    RAISE WARNING '⚠️ Migration may be incomplete. Please check manually.';
  END IF;
END $$;

