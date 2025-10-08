-- Drop the old version of user_create_with_activation that has p_department parameter
-- This resolves the function overload ambiguity error

DROP FUNCTION IF EXISTS public.user_create_with_activation(
  p_email text,
  p_full_name text,
  p_tenant_id uuid,
  p_organization_id uuid,
  p_phone text,
  p_department text,
  p_location text,
  p_role_type role_type
);

-- The correct version without p_department already exists and will remain