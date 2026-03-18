
-- Add permanent bank table for approved content
CREATE TABLE IF NOT EXISTS public.content_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_id UUID,
  source TEXT NOT NULL DEFAULT 'daily_feed',
  pillar_name TEXT,
  format TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  thread_tweets JSONB,
  video_prompt TEXT,
  word_count INTEGER,
  viral_score INTEGER,
  psychology_trigger TEXT,
  original_date DATE,
  posted_at TIMESTAMPTZ,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own content bank"
ON public.content_bank FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add columns to daily_posts
ALTER TABLE public.daily_posts
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS post_date DATE DEFAULT CURRENT_DATE;

-- Add columns to content_os_items
ALTER TABLE public.content_os_items
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add saved flag to video_bank
ALTER TABLE public.video_bank
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_content_bank_user
  ON public.content_bank(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_posts_date
  ON public.daily_posts(user_id, post_date);
