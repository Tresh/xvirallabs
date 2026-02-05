-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create admin_stats view for analytics (aggregated, no PII)
CREATE VIEW public.admin_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.viral_analyses) as total_analyses,
  (SELECT COUNT(*) FROM public.viral_patterns) as total_patterns,
  (SELECT COUNT(*) FROM public.idea_vault) as total_ideas,
  (SELECT COUNT(*) FROM public.profiles WHERE tier = 'pro') as pro_users,
  (SELECT COUNT(*) FROM public.profiles WHERE tier = 'elite') as elite_users,
  (SELECT COUNT(*) FROM public.viral_analyses WHERE created_at > now() - interval '7 days') as analyses_last_7_days,
  (SELECT COUNT(*) FROM public.viral_analyses WHERE created_at > now() - interval '30 days') as analyses_last_30_days;

-- Grant access to admin stats view only for admins
CREATE POLICY "Admins can view platform stats"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create content_flags table for moderation
CREATE TABLE public.content_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL CHECK (content_type IN ('analysis', 'pattern', 'idea')),
    content_id uuid NOT NULL,
    flagged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- Users can create flags
CREATE POLICY "Users can create flags"
ON public.content_flags
FOR INSERT
WITH CHECK (auth.uid() = flagged_by);

-- Users can view their own flags
CREATE POLICY "Users can view own flags"
ON public.content_flags
FOR SELECT
USING (auth.uid() = flagged_by);

-- Admins can view all flags
CREATE POLICY "Admins can view all flags"
ON public.content_flags
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update flags
CREATE POLICY "Admins can update flags"
ON public.content_flags
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete flags
CREATE POLICY "Admins can delete flags"
ON public.content_flags
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));