-- Add scheduling columns to content_calendar_days
ALTER TABLE public.content_calendar_days 
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS is_posted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ;

-- Create performance feedback table
CREATE TABLE public.post_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calendar_day_id UUID REFERENCES public.content_calendar_days(id) ON DELETE CASCADE,
  tweet_url TEXT,
  screenshot_url TEXT,
  
  -- Core metrics
  impressions INTEGER,
  likes INTEGER,
  retweets INTEGER,
  replies INTEGER,
  bookmarks INTEGER,
  
  -- Advanced metrics
  profile_visits INTEGER,
  link_clicks INTEGER,
  follows_gained INTEGER,
  
  -- Full breakdown
  audience_reached INTEGER,
  posted_time TIMESTAMPTZ,
  engagement_rate DECIMAL(5,2),
  
  -- AI analysis
  ai_analysis TEXT,
  ai_suggestions TEXT[],
  performance_score INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own performance" 
ON public.post_performance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance" 
ON public.post_performance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance" 
ON public.post_performance 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own performance" 
ON public.post_performance 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_post_performance_updated_at
BEFORE UPDATE ON public.post_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('performance-screenshots', 'performance-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'performance-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'performance-screenshots');