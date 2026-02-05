-- Create daily usage tracking table
CREATE TABLE public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON public.daily_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own usage records
CREATE POLICY "Users can insert their own usage"
ON public.daily_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update their own usage"
ON public.daily_usage
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage all (for edge function)
CREATE POLICY "Service role full access"
ON public.daily_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_daily_usage_updated_at
BEFORE UPDATE ON public.daily_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check and increment usage (returns remaining count or -1 if limit exceeded)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_current_count INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Get user's tier (default to 'free' if not set)
  SELECT COALESCE(tier, 'free') INTO v_tier
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If no profile found, treat as free tier
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;
  
  -- Set limit based on tier (pro and elite are unlimited = -1 means no limit)
  IF v_tier IN ('pro', 'elite') THEN
    RETURN -1; -- Unlimited
  END IF;
  
  -- Free tier limit
  v_limit := 5;
  
  -- Get or create today's usage record
  INSERT INTO public.daily_usage (user_id, date, analysis_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  -- Get current count
  SELECT analysis_count INTO v_current_count
  FROM public.daily_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN 0; -- No remaining
  END IF;
  
  -- Increment count
  UPDATE public.daily_usage
  SET analysis_count = analysis_count + 1
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Return remaining analyses
  v_remaining := v_limit - v_current_count - 1;
  RETURN v_remaining;
END;
$$;

-- Function to get remaining usage (for UI display)
CREATE OR REPLACE FUNCTION public.get_remaining_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_current_count INTEGER;
BEGIN
  -- Get user's tier
  SELECT COALESCE(tier, 'free') INTO v_tier
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;
  
  -- Pro/Elite users have unlimited
  IF v_tier IN ('pro', 'elite') THEN
    RETURN -1;
  END IF;
  
  v_limit := 5;
  
  -- Get current count for today
  SELECT COALESCE(analysis_count, 0) INTO v_current_count
  FROM public.daily_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  RETURN GREATEST(0, v_limit - COALESCE(v_current_count, 0));
END;
$$;