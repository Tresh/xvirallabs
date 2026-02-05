-- Content Lab Tables

-- Table for storing content calendar settings and metadata
CREATE TABLE public.content_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Content Calendar',
  calendar_length INTEGER NOT NULL DEFAULT 30,
  primary_niche TEXT NOT NULL,
  sub_niches TEXT[] DEFAULT '{}',
  audience_size TEXT,
  main_goal TEXT NOT NULL,
  monetization_type TEXT,
  posting_capacity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for inspiration accounts (DNA extraction)
CREATE TABLE public.content_inspirations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.content_calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  twitter_handle TEXT NOT NULL,
  analysis_result JSONB,
  hook_styles TEXT[],
  content_formats TEXT[],
  psychological_angles TEXT[],
  monetization_signals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for individual calendar days
CREATE TABLE public.content_calendar_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.content_calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE,
  content_goal TEXT NOT NULL,
  content_type TEXT NOT NULL,
  psychological_trigger TEXT,
  post_brief TEXT NOT NULL,
  draft_content TEXT,
  draft_why_it_works TEXT,
  draft_action_driven TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'drafted', 'scheduled', 'posted', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, day_number)
);

-- Table for daily coaching tips
CREATE TABLE public.content_coaching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_day_id UUID NOT NULL REFERENCES public.content_calendar_days(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  intent_explanation TEXT,
  best_posting_time TEXT,
  reply_strategy TEXT,
  follow_up_suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_coaching ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_calendars
CREATE POLICY "Users can view their own calendars"
ON public.content_calendars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendars"
ON public.content_calendars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars"
ON public.content_calendars FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars"
ON public.content_calendars FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for content_inspirations
CREATE POLICY "Users can view their own inspirations"
ON public.content_inspirations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inspirations"
ON public.content_inspirations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspirations"
ON public.content_inspirations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspirations"
ON public.content_inspirations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for content_calendar_days
CREATE POLICY "Users can view their own calendar days"
ON public.content_calendar_days FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar days"
ON public.content_calendar_days FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar days"
ON public.content_calendar_days FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar days"
ON public.content_calendar_days FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for content_coaching
CREATE POLICY "Users can view their own coaching"
ON public.content_coaching FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coaching"
ON public.content_coaching FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching"
ON public.content_coaching FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching"
ON public.content_coaching FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_content_calendars_updated_at
BEFORE UPDATE ON public.content_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_days_updated_at
BEFORE UPDATE ON public.content_calendar_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();