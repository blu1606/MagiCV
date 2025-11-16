ALTER TABLE public.components
ADD COLUMN content_hash TEXT;

CREATE UNIQUE INDEX components_user_id_content_hash_idx ON public.components (user_id, content_hash);
