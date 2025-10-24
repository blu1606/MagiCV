-- Vector search functions for Supabase
-- Run this SQL in your Supabase SQL Editor after creating the schema

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to match components based on embedding similarity
CREATE OR REPLACE FUNCTION match_components(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  user_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  account_id uuid,
  type text,
  title text,
  organization text,
  start_date date,
  end_date date,
  description text,
  highlights jsonb,
  embedding vector(768),
  created_at timestamptz,
  updated_at timestamptz,
  src text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    c.account_id,
    c.type,
    c.title,
    c.organization,
    c.start_date,
    c.end_date,
    c.description,
    c.highlights,
    c.embedding,
    c.created_at,
    c.updated_at,
    c.src,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM components c
  WHERE 
    (user_id_param IS NULL OR c.user_id = user_id_param)
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to match CVs based on embedding similarity
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
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM cvs cv
  LEFT JOIN components c ON c.user_id = cv.user_id
  WHERE 
    (user_id_param IS NULL OR cv.user_id = user_id_param)
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  GROUP BY cv.id
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Create index for faster vector search
CREATE INDEX IF NOT EXISTS components_embedding_idx 
ON components 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION match_components TO authenticated;
GRANT EXECUTE ON FUNCTION match_cvs TO authenticated;
GRANT EXECUTE ON FUNCTION match_components TO anon;
GRANT EXECUTE ON FUNCTION match_cvs TO anon;

