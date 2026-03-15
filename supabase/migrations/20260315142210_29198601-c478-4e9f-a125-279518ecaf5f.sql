-- Create content pillars table
CREATE TABLE IF NOT EXISTS public.content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pillar_name TEXT NOT NULL,
  pillar_description TEXT,
  pillar_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#3B8BD4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content operating system items table
CREATE TABLE IF NOT EXISTS public.content_os_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  pillar_name TEXT,
  format TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  thread_tweets JSONB,
  video_prompt TEXT,
  word_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  viral_score INTEGER,
  psychology_trigger TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_os_items_format_valid CHECK (format IN ('two_liner', 'medium_tweet', 'thread', 'article', 'video_script', 'newsletter')),
  CONSTRAINT content_os_items_status_valid CHECK (status IN ('pending', 'approved', 'posted', 'skipped'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_os_user_date
  ON public.content_os_items (user_id, generated_date);

CREATE INDEX IF NOT EXISTS idx_content_pillars_user
  ON public.content_pillars (user_id, pillar_order);

-- Enable RLS
ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_os_items ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Users can view own content pillars" ON public.content_pillars;
DROP POLICY IF EXISTS "Users can insert own content pillars" ON public.content_pillars;
DROP POLICY IF EXISTS "Users can update own content pillars" ON public.content_pillars;
DROP POLICY IF EXISTS "Users can delete own content pillars" ON public.content_pillars;

CREATE POLICY "Users can view own content pillars"
ON public.content_pillars
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content pillars"
ON public.content_pillars
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content pillars"
ON public.content_pillars
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content pillars"
ON public.content_pillars
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own content os items" ON public.content_os_items;
DROP POLICY IF EXISTS "Users can insert own content os items" ON public.content_os_items;
DROP POLICY IF EXISTS "Users can update own content os items" ON public.content_os_items;
DROP POLICY IF EXISTS "Users can delete own content os items" ON public.content_os_items;

CREATE POLICY "Users can view own content os items"
ON public.content_os_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content os items"
ON public.content_os_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content os items"
ON public.content_os_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content os items"
ON public.content_os_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Updated-at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_content_pillars_updated_at'
  ) THEN
    CREATE TRIGGER update_content_pillars_updated_at
    BEFORE UPDATE ON public.content_pillars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_content_os_items_updated_at'
  ) THEN
    CREATE TRIGGER update_content_os_items_updated_at
    BEFORE UPDATE ON public.content_os_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;