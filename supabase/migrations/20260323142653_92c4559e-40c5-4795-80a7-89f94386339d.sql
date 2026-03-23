-- Add algorithm scoring columns to daily_posts
ALTER TABLE public.daily_posts
ADD COLUMN IF NOT EXISTS algorithm_score TEXT DEFAULT 'reply_driver',
ADD COLUMN IF NOT EXISTS reply_bait_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dwell_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follow_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_reply_bait BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recommended_post_time TEXT,
ADD COLUMN IF NOT EXISTS pillar_drift_warning BOOLEAN DEFAULT false;

-- Add same to content_os_items
ALTER TABLE public.content_os_items
ADD COLUMN IF NOT EXISTS algorithm_score TEXT DEFAULT 'reply_driver',
ADD COLUMN IF NOT EXISTS reply_bait_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dwell_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follow_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_reply_bait BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recommended_post_time TEXT,
ADD COLUMN IF NOT EXISTS pillar_drift_warning BOOLEAN DEFAULT false;

-- Add to content_bank
ALTER TABLE public.content_bank
ADD COLUMN IF NOT EXISTS algorithm_score TEXT,
ADD COLUMN IF NOT EXISTS reply_bait_score INTEGER,
ADD COLUMN IF NOT EXISTS dwell_score INTEGER,
ADD COLUMN IF NOT EXISTS follow_score INTEGER,
ADD COLUMN IF NOT EXISTS share_score INTEGER;

-- Telegram settings table
CREATE TABLE IF NOT EXISTS public.telegram_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  bot_token TEXT,
  channel_id TEXT,
  channel_username TEXT,
  auto_post_approved BOOLEAN DEFAULT false,
  morning_delivery BOOLEAN DEFAULT false,
  notify_viral BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'telegram_settings' 
    AND policyname = 'Users manage own telegram settings'
  ) THEN
    CREATE POLICY "Users manage own telegram settings"
    ON public.telegram_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;