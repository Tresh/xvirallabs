-- 1. Add DELETE policy for brand_voice
CREATE POLICY "Users can delete own brand voice"
ON public.brand_voice
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Secure admin_platform_stats view
DROP VIEW IF EXISTS public.admin_platform_stats;
CREATE VIEW public.admin_platform_stats WITH (security_invoker = on) AS
SELECT
  (SELECT count(*) FROM public.profiles) AS total_users,
  (SELECT count(*) FROM public.viral_analyses) AS total_analyses,
  (SELECT count(*) FROM public.viral_patterns) AS total_patterns,
  (SELECT count(*) FROM public.idea_vault) AS total_ideas,
  (SELECT count(*) FROM public.profiles WHERE tier = 'pro') AS pro_users,
  (SELECT count(*) FROM public.profiles WHERE tier = 'elite') AS elite_users,
  (SELECT count(*) FROM public.viral_analyses WHERE created_at > now() - interval '7 days') AS analyses_last_7_days,
  (SELECT count(*) FROM public.viral_analyses WHERE created_at > now() - interval '30 days') AS analyses_last_30_days;