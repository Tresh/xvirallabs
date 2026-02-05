-- Drop the security definer view and recreate with security_invoker
DROP VIEW IF EXISTS public.admin_platform_stats;

-- Recreate with security_invoker=on (safer approach)
CREATE VIEW public.admin_platform_stats
WITH (security_invoker=on) AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.viral_analyses) as total_analyses,
  (SELECT COUNT(*) FROM public.viral_patterns) as total_patterns,
  (SELECT COUNT(*) FROM public.idea_vault) as total_ideas,
  (SELECT COUNT(*) FROM public.profiles WHERE tier = 'pro') as pro_users,
  (SELECT COUNT(*) FROM public.profiles WHERE tier = 'elite') as elite_users,
  (SELECT COUNT(*) FROM public.viral_analyses WHERE created_at > now() - interval '7 days') as analyses_last_7_days,
  (SELECT COUNT(*) FROM public.viral_analyses WHERE created_at > now() - interval '30 days') as analyses_last_30_days;