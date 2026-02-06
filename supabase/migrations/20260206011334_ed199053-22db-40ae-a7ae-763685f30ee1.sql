-- Create brand_pillars table to store the 5 content pillars per calendar/plan
CREATE TABLE public.brand_pillars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.content_calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  pillar_name TEXT NOT NULL,
  pillar_order INTEGER NOT NULL DEFAULT 1,
  purpose TEXT,
  audience_need TEXT,
  psychology_trigger TEXT,
  example_formats TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_ideas table for the mind-map structure (ideas, not full tweets)
CREATE TABLE public.content_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.content_calendars(id) ON DELETE CASCADE,
  pillar_id UUID REFERENCES public.brand_pillars(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  idea_order INTEGER NOT NULL DEFAULT 1,
  idea_title TEXT NOT NULL,
  idea_type TEXT NOT NULL DEFAULT 'short_take',
  intent TEXT DEFAULT 'reach',
  psychology_hint TEXT,
  generated_content TEXT,
  why_it_works TEXT,
  is_saved_to_vault BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'idea',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brand_pillars
ALTER TABLE public.brand_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand pillars"
ON public.brand_pillars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand pillars"
ON public.brand_pillars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand pillars"
ON public.brand_pillars FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand pillars"
ON public.brand_pillars FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on content_ideas
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content ideas"
ON public.content_ideas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content ideas"
ON public.content_ideas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content ideas"
ON public.content_ideas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content ideas"
ON public.content_ideas FOR DELETE
USING (auth.uid() = user_id);

-- Add timestamps triggers
CREATE TRIGGER update_brand_pillars_updated_at
BEFORE UPDATE ON public.brand_pillars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_ideas_updated_at
BEFORE UPDATE ON public.content_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add pillars_generated flag to content_calendars
ALTER TABLE public.content_calendars 
ADD COLUMN IF NOT EXISTS pillars_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mind_map_generated BOOLEAN DEFAULT false;