-- Fix the organization-tenant validation to handle standalone organizations
-- For standalone organizations (where tenant_id is NULL), the organization_id IS the tenant_id

CREATE OR REPLACE FUNCTION public._assert_record_matches_org_tenant(p_org_id uuid, p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_tenant_id uuid;
BEGIN
  -- Get the organization's tenant_id
  SELECT tenant_id INTO v_org_tenant_id
  FROM public.organizations
  WHERE id = p_org_id;

  -- If organization not found, raise error
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Organization % not found', p_org_id
      USING ERRCODE = '23514';
  END IF;

  -- For standalone organizations (tenant_id is NULL), 
  -- the organization_id itself serves as the tenant_id
  IF v_org_tenant_id IS NULL THEN
    IF p_tenant_id != p_org_id THEN
      RAISE EXCEPTION 'For standalone organization %, tenant_id must equal organization_id %, but got %',
        p_org_id, p_org_id, p_tenant_id
        USING ERRCODE = '23514';
    END IF;
  ELSE
    -- For organizations under an enterprise, tenant must match
    IF v_org_tenant_id != p_tenant_id THEN
      RAISE EXCEPTION 'Organization % (tenant %) does not match provided tenant %',
        p_org_id, v_org_tenant_id, p_tenant_id
        USING ERRCODE = '23514';
    END IF;
  END IF;
END;
$function$;