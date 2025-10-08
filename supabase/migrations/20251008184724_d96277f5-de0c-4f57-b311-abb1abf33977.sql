-- Fix trigger to allow NULL organization_id for platform admins
-- The trigger should only validate organization/tenant relationship when organization_id is present

CREATE OR REPLACE FUNCTION public.trg_users_enforce_org_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip validation if organization_id is NULL (valid for platform admins)
  IF NEW.organization_id IS NOT NULL THEN
    PERFORM public.assert_record_matches_org_tenant(NEW.organization_id, NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Also fix the user_roles trigger for the same reason
CREATE OR REPLACE FUNCTION public.trg_user_roles_enforce_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_tenant uuid;
  v_org_tenant uuid;
BEGIN
  -- Skip validation if organization_id is NULL (valid for platform admins)
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT tenant_id INTO v_user_tenant FROM public.users WHERE id = NEW.user_id;
  SELECT tenant_id INTO v_org_tenant FROM public.organizations WHERE id = NEW.organization_id;

  IF v_user_tenant IS NULL OR v_org_tenant IS NULL OR v_user_tenant <> v_org_tenant THEN
    RAISE EXCEPTION 'Cross-tenant reference not allowed (user_roles.user_id vs organization_id)';
  END IF;

  RETURN NEW;
END;
$$;