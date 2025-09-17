-- Organization report settings: per-org visibility for responder dashboard
-- Tenancy enforced via tenant_id and RLS

-- 1) Table
CREATE TABLE IF NOT EXISTS public.organization_report_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  visible_to_responders BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_org_report_settings UNIQUE (tenant_id, organization_id, template_id)
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_org_report_settings_tenant ON public.organization_report_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_report_settings_org ON public.organization_report_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_report_settings_template ON public.organization_report_settings(template_id);

-- 3) RLS
ALTER TABLE public.organization_report_settings ENABLE ROW LEVEL SECURITY;

-- View within same tenant
DROP POLICY IF EXISTS "Tenant users can view org report settings" ON public.organization_report_settings;
CREATE POLICY "Tenant users can view org report settings"
ON public.organization_report_settings
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

-- Manage within tenant by platform, enterprise, or matching org admin
DROP POLICY IF EXISTS "Admins can manage org report settings" ON public.organization_report_settings;
CREATE POLICY "Admins can manage org report settings"
ON public.organization_report_settings
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = get_current_user_tenant_id()
  AND (
    is_platform_admin()
    OR user_has_role('enterprise_admin')
    OR (user_has_role('organization_admin') AND organization_id = get_current_user_organization_id())
  )
);

DROP POLICY IF EXISTS "Admins can update org report settings" ON public.organization_report_settings;
CREATE POLICY "Admins can update org report settings"
ON public.organization_report_settings
FOR UPDATE
TO authenticated
USING (
  tenant_id = get_current_user_tenant_id()
  AND (
    is_platform_admin()
    OR user_has_role('enterprise_admin')
    OR (user_has_role('organization_admin') AND organization_id = get_current_user_organization_id())
  )
)
WITH CHECK (
  tenant_id = get_current_user_tenant_id()
  AND (
    is_platform_admin()
    OR user_has_role('enterprise_admin')
    OR (user_has_role('organization_admin') AND organization_id = get_current_user_organization_id())
  )
);

DROP POLICY IF EXISTS "Admins can delete org report settings" ON public.organization_report_settings;
CREATE POLICY "Admins can delete org report settings"
ON public.organization_report_settings
FOR DELETE
TO authenticated
USING (
  tenant_id = get_current_user_tenant_id()
  AND (
    is_platform_admin()
    OR user_has_role('enterprise_admin')
    OR (user_has_role('organization_admin') AND organization_id = get_current_user_organization_id())
  )
);


