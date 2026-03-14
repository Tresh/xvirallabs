
-- Daily posts table (core of the Daily Growth Feed)
CREATE TABLE IF NOT EXISTS public.daily_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'tweet',
  status TEXT NOT NULL DEFAULT 'pending',
  viral_score INTEGER,
  psychology_trigger TEXT,
  why_it_works TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily posts" ON public.daily_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_daily_posts_updated_at BEFORE UPDATE ON public.daily_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Growth tracking table
CREATE TABLE IF NOT EXISTS public.growth_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  follower_count INTEGER,
  following_count INTEGER,
  posts_published INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  weekly_gain INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.growth_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own growth snapshots" ON public.growth_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
