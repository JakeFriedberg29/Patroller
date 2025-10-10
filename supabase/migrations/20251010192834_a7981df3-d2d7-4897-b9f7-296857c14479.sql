-- Create get_current_user_tenant_id helper function to get the tenant_id for the current auth user
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid();
$$;