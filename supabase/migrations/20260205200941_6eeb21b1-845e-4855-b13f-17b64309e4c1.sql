-- Create profiles table for user identity
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  twitter_handle TEXT,
  primary_niche TEXT,
  secondary_niches TEXT[] DEFAULT '{}',
  brand_tone TEXT DEFAULT 'authoritative' CHECK (brand_tone IN ('authoritative', 'relatable', 'bold', 'playful')),
  growth_goal TEXT DEFAULT 'followers' CHECK (growth_goal IN ('followers', 'leads', 'sales', 'authority')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create viral_analyses table for saved analyses
CREATE TABLE public.viral_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_source TEXT NOT NULL CHECK (post_source IN ('link', 'screenshot', 'text')),
  original_post TEXT NOT NULL,
  mode_used INTEGER NOT NULL,
  analysis_result TEXT NOT NULL,
  identified_hook TEXT,
  psychology_triggers TEXT[] DEFAULT '{}',
  viral_pattern TEXT,
  dwell_time_score TEXT CHECK (dwell_time_score IN ('low', 'medium', 'high')),
  reply_potential INTEGER CHECK (reply_potential BETWEEN 1 AND 10),
  bookmark_potential INTEGER CHECK (bookmark_potential BETWEEN 1 AND 10),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create viral_patterns table for extracted reusable patterns
CREATE TABLE public.viral_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  pattern_template TEXT NOT NULL,
  hook_framework TEXT,
  best_for_niches TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  source_analysis_id UUID REFERENCES public.viral_analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create idea_vault table for saved ideas
CREATE TABLE public.idea_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_title TEXT NOT NULL,
  idea_content TEXT,
  idea_status TEXT DEFAULT 'unused' CHECK (idea_status IN ('unused', 'drafted', 'posted', 'archived')),
  hook_type TEXT,
  emotion_trigger TEXT,
  generated_from_pattern_id UUID REFERENCES public.viral_patterns(id) ON DELETE SET NULL,
  generated_from_analysis_id UUID REFERENCES public.viral_analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create brand_voice table for personalization
CREATE TABLE public.brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  writing_traits TEXT[] DEFAULT '{}',
  words_to_avoid TEXT[] DEFAULT '{}',
  signature_phrases TEXT[] DEFAULT '{}',
  preferred_hooks TEXT[] DEFAULT '{}',
  avoid_hooks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voice ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for viral_analyses
CREATE POLICY "Users can view own analyses" ON public.viral_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.viral_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.viral_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.viral_analyses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for viral_patterns
CREATE POLICY "Users can view own patterns" ON public.viral_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patterns" ON public.viral_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patterns" ON public.viral_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patterns" ON public.viral_patterns FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for idea_vault
CREATE POLICY "Users can view own ideas" ON public.idea_vault FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON public.idea_vault FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON public.idea_vault FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON public.idea_vault FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for brand_voice
CREATE POLICY "Users can view own brand voice" ON public.brand_voice FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand voice" ON public.brand_voice FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand voice" ON public.brand_voice FOR UPDATE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.brand_voice (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_idea_vault_updated_at BEFORE UPDATE ON public.idea_vault FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_voice_updated_at BEFORE UPDATE ON public.brand_voice FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_viral_analyses_user_id ON public.viral_analyses(user_id);
CREATE INDEX idx_viral_analyses_created_at ON public.viral_analyses(created_at DESC);
CREATE INDEX idx_viral_patterns_user_id ON public.viral_patterns(user_id);
CREATE INDEX idx_idea_vault_user_id ON public.idea_vault(user_id);
CREATE INDEX idx_idea_vault_status ON public.idea_vault(idea_status);