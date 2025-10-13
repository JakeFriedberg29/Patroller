-- Create the missing user_has_role security definer function
-- This function is needed by RLS policies and frontend permission checks
CREATE OR REPLACE FUNCTION public.user_has_role(p_user_id uuid, p_role_type role_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = p_user_id
      AND ur.role_type = p_role_type
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Overload for single parameter (defaults to current user)
CREATE OR REPLACE FUNCTION public.user_has_role(p_role_type role_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND ur.role_type = p_role_type
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Set active persona to 'admin' for jakefriedberg32@gmail.com
UPDATE public.users
SET preferences = jsonb_set(
  COALESCE(preferences, '{}'::jsonb),
  '{active_persona}',
  '"admin"'::jsonb
)
WHERE email = 'jakefriedberg32@gmail.com';

-- Audit log
INSERT INTO public.audit_logs (
  tenant_id,
  user_id,
  action,
  resource_type,
  resource_id,
  metadata
)
SELECT
  u.tenant_id,
  u.id,
  'FIX_PERMISSIONS',
  'user',
  u.id,
  jsonb_build_object(
    'active_persona_set', 'admin',
    'function_created', 'user_has_role'
  )
FROM public.users u
WHERE u.email = 'jakefriedberg32@gmail.com';