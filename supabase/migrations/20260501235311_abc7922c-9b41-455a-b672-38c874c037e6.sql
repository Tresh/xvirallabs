CREATE OR REPLACE FUNCTION public.get_remaining_usage(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_current_count INTEGER;
BEGIN
  IF p_user_id IS NULL OR auth.uid() IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(tier, 'free') INTO v_tier FROM public.profiles WHERE user_id = p_user_id;
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;
  IF v_tier IN ('pro', 'elite') THEN RETURN -1; END IF;
  v_limit := 3;

  SELECT COALESCE(analysis_count, 0) INTO v_current_count
  FROM public.daily_usage WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN GREATEST(0, v_limit - COALESCE(v_current_count, 0));
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_current_count INTEGER;
  v_remaining INTEGER;
BEGIN
  IF p_user_id IS NULL OR auth.uid() IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(tier, 'free') INTO v_tier FROM public.profiles WHERE user_id = p_user_id;
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;
  IF v_tier IN ('pro', 'elite') THEN RETURN -1; END IF;
  v_limit := 3;

  INSERT INTO public.daily_usage (user_id, date, analysis_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  SELECT analysis_count INTO v_current_count
  FROM public.daily_usage WHERE user_id = p_user_id AND date = CURRENT_DATE;

  IF v_current_count >= v_limit THEN RETURN 0; END IF;

  UPDATE public.daily_usage SET analysis_count = analysis_count + 1
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  v_remaining := v_limit - v_current_count - 1;
  RETURN v_remaining;
END;
$function$;