-- Delete all organization-related data and organizations themselves
DO $$
DECLARE
  _org_id uuid;
BEGIN
  -- Remove platform admin assignments tied to organizations
  DELETE FROM public.platform_admin_account_assignments WHERE account_type = 'Organization';

  -- Null out foreign keys on users/departments that reference organizations to avoid FK errors
  UPDATE public.users SET organization_id = NULL, department_id = NULL WHERE organization_id IS NOT NULL OR department_id IS NOT NULL;

  -- Delete dependent child tables scoped by organizations
  DELETE FROM public.report_templates WHERE organization_id IS NOT NULL;
  DELETE FROM public.incidents WHERE organization_id IS NOT NULL;
  DELETE FROM public.equipment WHERE organization_id IS NOT NULL;
  DELETE FROM public.locations WHERE organization_id IS NOT NULL;
  DELETE FROM public.departments WHERE organization_id IS NOT NULL;

  -- Deactivate org-scoped user_roles and clear org link
  UPDATE public.user_roles SET is_active = false, organization_id = NULL WHERE organization_id IS NOT NULL;

  -- Finally, delete organizations (including MissionLog organizations)
  DELETE FROM public.organizations;
END $$;


