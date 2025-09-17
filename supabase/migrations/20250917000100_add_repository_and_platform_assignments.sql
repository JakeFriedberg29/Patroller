-- Repository & Platform Assignments
-- Adds tenant_id to report_templates, allows platform-scoped templates, and creates generic platform_assignments

-- 1) Enums for generic platform assignments
DO $$ BEGIN
  CREATE TYPE public.platform_element_type AS ENUM ('report_template');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.platform_assignment_target_type AS ENUM ('organization', 'organization_type');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Report templates: add tenant_id and relax org requirement
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Backfill tenant_id from organization
UPDATE public.report_templates rt
SET tenant_id = org.tenant_id
FROM public.organizations org
WHERE rt.organization_id = org.id AND rt.tenant_id IS NULL;

-- Enforce NOT NULL for tenant_id
ALTER TABLE public.report_templates ALTER COLUMN tenant_id SET NOT NULL;

-- Allow platform-scoped templates (no org)
ALTER TABLE public.report_templates ALTER COLUMN organization_id DROP NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_templates_tenant_id ON public.report_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_org_id ON public.report_templates(organization_id);

-- Ensure platform-level template names are unique per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uniq_platform_report_templates_tenant_name
ON public.report_templates(tenant_id, name)
WHERE organization_id IS NULL;

-- RLS policy: tenant-scoped visibility
DROP POLICY IF EXISTS "Tenant users can view tenant report templates" ON public.report_templates;
CREATE POLICY "Tenant users can view tenant report templates"
ON public.report_templates
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());

-- 3) Generic platform assignments table
CREATE TABLE IF NOT EXISTS public.platform_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
  element_type public.platform_element_type NOT NULL,
  element_id UUID NOT NULL,
  target_type public.platform_assignment_target_type NOT NULL,
  target_organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  target_organization_type public.organization_type,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT platform_assignments_target_check CHECK (
    (target_type = 'organization' AND target_organization_id IS NOT NULL AND target_organization_type IS NULL)
    OR (target_type = 'organization_type' AND target_organization_type IS NOT NULL AND target_organization_id IS NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_assignments_tenant ON public.platform_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_assignments_element ON public.platform_assignments(element_type, element_id);
CREATE INDEX IF NOT EXISTS idx_platform_assignments_target_org ON public.platform_assignments(target_organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_assignments_target_org_type ON public.platform_assignments(target_organization_type);

-- RLS
ALTER TABLE public.platform_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can manage platform assignments" ON public.platform_assignments;
CREATE POLICY "Platform admins can manage platform assignments"
ON public.platform_assignments
FOR ALL
TO authenticated
USING (is_platform_admin())
WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "Tenant users can view platform assignments" ON public.platform_assignments;
CREATE POLICY "Tenant users can view platform assignments"
ON public.platform_assignments
FOR SELECT
TO authenticated
USING (tenant_id = get_current_user_tenant_id());


