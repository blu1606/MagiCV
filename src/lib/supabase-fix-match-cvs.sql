-- Fix match_cvs function
-- Issue: Function currently joins with components table but should use cvs.embedding
-- Solution: Option A - Add embedding column to cvs table and fix function

-- Step 1: Add embedding column to cvs table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cvs' 
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE cvs ADD COLUMN embedding vector(768);
  END IF;
END $$;

-- Step 2: Create index for vector search on cvs.embedding
CREATE INDEX IF NOT EXISTS cvs_embedding_idx 
ON cvs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Step 3: Fix match_cvs function to use cvs.embedding instead of components.embedding
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_cvs TO authenticated;
GRANT EXECUTE ON FUNCTION match_cvs TO anon;

-- Verify fix
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Generate embeddings for existing CVs (if any)';
  RAISE NOTICE '   2. Update code to generate embeddings when creating CVs';
  RAISE NOTICE '   3. Verify storage bucket cv_pdfs exists in Supabase Dashboard';
END $$;

