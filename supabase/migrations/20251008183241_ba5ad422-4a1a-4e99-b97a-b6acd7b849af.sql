-- Create the missing _assert_record_matches_org_tenant function
-- This function validates that an organization belongs to the specified tenant

CREATE OR REPLACE FUNCTION public._assert_record_matches_org_tenant(
  p_org_id uuid,
  p_tenant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the organization exists and belongs to the specified tenant
  IF NOT EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE id = p_org_id
      AND tenant_id = p_tenant_id
  ) THEN
    RAISE EXCEPTION 'Organization % does not belong to tenant % or does not exist',
      p_org_id, p_tenant_id
      USING ERRCODE = '23514'; -- check_violation
  END IF;
END;
$$;

-- Create the missing _assert_same_tenant_for_user function
-- This function validates that a user and organization belong to the same tenant

CREATE OR REPLACE FUNCTION public._assert_same_tenant_for_user(
  p_user_id uuid,
  p_org_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_tenant uuid;
  v_org_tenant uuid;
BEGIN
  -- Get user's tenant
  SELECT tenant_id INTO v_user_tenant
  FROM public.users
  WHERE id = p_user_id;

  -- Get organization's tenant
  SELECT tenant_id INTO v_org_tenant
  FROM public.organizations
  WHERE id = p_org_id;

  -- Validate both exist and match
  IF v_user_tenant IS NULL THEN
    RAISE EXCEPTION 'User % not found', p_user_id
      USING ERRCODE = '23514';
  END IF;

  IF v_org_tenant IS NULL THEN
    RAISE EXCEPTION 'Organization % not found', p_org_id
      USING ERRCODE = '23514';
  END IF;

  IF v_user_tenant <> v_org_tenant THEN
    RAISE EXCEPTION 'User % (tenant %) and Organization % (tenant %) belong to different tenants',
      p_user_id, v_user_tenant, p_org_id, v_org_tenant
      USING ERRCODE = '23514';
  END IF;
END;
$$;