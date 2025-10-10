-- Create is_platform_admin helper function
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND ur.role_type = 'platform_admin'::role_type
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;