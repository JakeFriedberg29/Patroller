-- Recreate the wrapper function for assert_record_matches_org_tenant
-- This ensures it properly references the now-existing base function

DROP FUNCTION IF EXISTS public.assert_record_matches_org_tenant(uuid, uuid);

CREATE OR REPLACE FUNCTION public.assert_record_matches_org_tenant(p_org_id uuid, p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_record_matches_org_tenant(p_org_id, p_tenant_id);
END;
$$;

-- Also recreate the wrapper for assert_same_tenant_for_user_and_org
DROP FUNCTION IF EXISTS public.assert_same_tenant_for_user_and_org(uuid, uuid);

CREATE OR REPLACE FUNCTION public.assert_same_tenant_for_user_and_org(p_user_id uuid, p_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_same_tenant_for_user(p_user_id, p_org_id);
END;
$$;