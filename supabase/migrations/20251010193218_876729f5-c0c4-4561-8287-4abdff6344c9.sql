-- Allow platform-level report templates (organization_id is NULL)
CREATE OR REPLACE FUNCTION public.trg_report_templates_enforce_creator_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If no creator, skip
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;
  -- Platform-level templates have NULL organization_id; skip tenant/org validation
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM public.assert_same_tenant_for_user_and_org(NEW.created_by, NEW.organization_id);
  RETURN NEW;
END;
$$;