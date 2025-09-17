-- Add template references, indexes, RLS policies, and a convenience view for reports

-- 1) Columns: template_id reference and optional template_version
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_version INTEGER;

-- 2) Indexes
-- Routing / filtering
CREATE INDEX IF NOT EXISTS idx_reports_tenant_template_submitted
  ON public.reports(tenant_id, template_id, submitted_at DESC);

-- JSONB GIN for ad-hoc queries inside metadata
CREATE INDEX IF NOT EXISTS idx_reports_metadata_gin
  ON public.reports USING GIN (metadata jsonb_path_ops);

-- 3) RLS: insert/update constrained to same tenant (select policy assumed to exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_insert_same_tenant'
  ) THEN
    CREATE POLICY reports_insert_same_tenant ON public.reports
      FOR INSERT
      WITH CHECK (tenant_id = public.get_current_user_tenant_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_update_same_tenant'
  ) THEN
    CREATE POLICY reports_update_same_tenant ON public.reports
      FOR UPDATE
      USING (tenant_id = public.get_current_user_tenant_id())
      WITH CHECK (tenant_id = public.get_current_user_tenant_id());
  END IF;
END $$;

-- 4) Tenant integrity: ensure template belongs to same tenant as report
CREATE OR REPLACE FUNCTION public.ensure_reports_template_same_tenant()
RETURNS TRIGGER AS $$
DECLARE
  tpl_tenant_id UUID;
BEGIN
  IF NEW.template_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT tenant_id INTO tpl_tenant_id
  FROM public.report_templates
  WHERE id = NEW.template_id;

  IF tpl_tenant_id IS NULL OR tpl_tenant_id <> NEW.tenant_id THEN
    RAISE EXCEPTION 'Template tenant mismatch for report % (tenant %)', NEW.id, NEW.tenant_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_template_tenant_check ON public.reports;
CREATE TRIGGER trg_reports_template_tenant_check
BEFORE INSERT OR UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.ensure_reports_template_same_tenant();

-- 5) Convenience view: project common fields for UI/analytics (inherits RLS from base table)
DROP VIEW IF EXISTS public.reports_flat;
CREATE VIEW public.reports_flat AS
SELECT
  r.id,
  r.tenant_id,
  r.account_id,
  r.account_type,
  r.template_id,
  r.template_version,
  r.report_type,
  r.submitted_at,
  r.created_by,
  r.title,
  r.description,
  r.metadata,
  r.metadata->>'incidentType' AS incident_type,
  r.metadata->>'severityLevel' AS severity,
  r.metadata->>'status' AS status
FROM public.reports r;


