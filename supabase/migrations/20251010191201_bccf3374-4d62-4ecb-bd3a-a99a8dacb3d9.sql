-- Recreate the missing wrapper function for platform admin checks
-- This function is called by various stored procedures like organization_update_or_delete
CREATE OR REPLACE FUNCTION public.ensure_current_user_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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