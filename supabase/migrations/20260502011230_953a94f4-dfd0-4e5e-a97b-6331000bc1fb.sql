
-- 1. Replace broad admin SELECT on profiles with a restricted directory view
DROP POLICY IF EXISTS "Admins can view platform stats" ON public.profiles;

CREATE OR REPLACE VIEW public.admin_user_directory
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  p.twitter_handle,
  p.tier,
  p.primary_niche,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE public.has_role(auth.uid(), 'admin');

GRANT SELECT ON public.admin_user_directory TO authenticated;

-- 2. Lock down user_roles writes: admins only, with USING + WITH CHECK guards,
-- and prevent admins from modifying their own admin row.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND user_id <> auth.uid()
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND user_id <> auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND user_id <> auth.uid()
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND user_id <> auth.uid()
);

-- 3. Scope storage upload policy to authenticated only
DROP POLICY IF EXISTS "Users can upload their own screenshots" ON storage.objects;

CREATE POLICY "Users can upload their own screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'performance-screenshots'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
