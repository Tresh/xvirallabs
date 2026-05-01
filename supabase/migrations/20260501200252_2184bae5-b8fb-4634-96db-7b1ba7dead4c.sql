
-- ============================================================
-- SECURITY HARDENING MIGRATION
-- ============================================================

-- 1) Lock down RPC functions: validate caller and revoke public execute
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
  v_limit := 5;

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
  v_limit := 5;

  SELECT COALESCE(analysis_count, 0) INTO v_current_count
  FROM public.daily_usage WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN GREATEST(0, v_limit - COALESCE(v_current_count, 0));
END;
$function$;

-- Restrict execution: only service role can call these directly. Edge functions
-- and clients can still invoke via supabase.rpc() when authenticated, but we
-- only grant authenticated execute (anon revoked).
REVOKE EXECUTE ON FUNCTION public.check_and_increment_usage(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_remaining_usage(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_increment_usage(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_remaining_usage(uuid) TO authenticated, service_role;

-- has_role and get_user_role already validate by auth.uid() implicitly via RLS;
-- restrict anon from calling them.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;

-- 2) Prevent self-tier-escalation: column-level UPDATE on profiles.tier
REVOKE UPDATE (tier) ON public.profiles FROM authenticated, anon, PUBLIC;
GRANT UPDATE (
  email, twitter_handle, primary_niche, secondary_niches, brand_tone,
  growth_goal, display_name, skills, content_strategy, custom_system_prompt
) ON public.profiles TO authenticated;

-- Also harden profiles UPDATE policy with WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3) Re-scope RLS policies on profiles from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view platform stats" ON public.profiles;
CREATE POLICY "Admins can view platform stats" ON public.profiles
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 4) Re-scope RLS policies on sensitive user tables to {authenticated}
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'content_bank','daily_posts','growth_snapshots','sales_campaigns','sales_posts',
    'messages','conversations','products','video_bank','brand_voice','brand_pillars',
    'content_calendar_days','content_calendars','content_coaching','content_flags',
    'content_ideas','content_inspirations','idea_vault','post_performance',
    'viral_analyses','viral_patterns','user_roles','telegram_settings','daily_usage'
  ];
  pol RECORD;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename=t AND 'public' = ANY(roles)
    LOOP
      EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated', pol.policyname, t);
    END LOOP;
  END LOOP;
END$$;

-- 5) Storage: lock down performance-screenshots bucket
UPDATE storage.buckets SET public = false WHERE id = 'performance-screenshots';

DROP POLICY IF EXISTS "Public can view screenshots" ON storage.objects;
CREATE POLICY "Users view own screenshots" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'performance-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add UPDATE and DELETE policies scoped to owner
CREATE POLICY "Users update own screenshots" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'performance-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'performance-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own screenshots" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'performance-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]);
