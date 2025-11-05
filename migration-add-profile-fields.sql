-- Add missing essential fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Vietnam',
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);

-- Update existing rows to have default country
UPDATE profiles SET country = 'Vietnam' WHERE country IS NULL;
