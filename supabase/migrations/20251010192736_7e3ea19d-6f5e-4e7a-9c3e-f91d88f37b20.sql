-- Create get_current_user_id helper function to get the public.users.id for the current auth user
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- Also create user_get_current_user_id as an alias for consistency with naming conventions
CREATE OR REPLACE FUNCTION public.user_get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;