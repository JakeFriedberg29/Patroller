-- 1) Enum and column for report template status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_template_status') THEN
    CREATE TYPE public.report_template_status AS ENUM ('draft', 'ready', 'published', 'unpublished');
  END IF;
END $$;

ALTER TABLE public.report_templates
  ADD COLUMN IF NOT EXISTS status public.report_template_status NOT NULL DEFAULT 'draft';

-- 2) Enforce transitions and apply side-effects (publish/unpublish) + audit log
CREATE OR REPLACE FUNCTION public.enforce_report_template_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed BOOLEAN := TRUE;
BEGIN
  -- Allow inserts with any status
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions:
  -- draft -> draft|ready
  -- ready -> ready|draft|published
  -- published -> published|unpublished
  -- unpublished -> unpublished|ready|draft
  IF OLD.status = 'draft' AND NEW.status NOT IN ('draft','ready') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'ready' AND NEW.status NOT IN ('ready','draft','published') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'published' AND NEW.status NOT IN ('published','unpublished') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'unpublished' AND NEW.status NOT IN ('unpublished','ready','draft') THEN
    allowed := FALSE;
  END IF;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_report_templates_enforce_status ON public.report_templates;
CREATE TRIGGER trg_report_templates_enforce_status
BEFORE UPDATE OF status ON public.report_templates
FOR EACH ROW EXECUTE FUNCTION public.enforce_report_template_status_transition();

-- Side effects and audit log after change
CREATE OR REPLACE FUNCTION public.apply_report_template_status_effects()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID := NULL;
BEGIN
  -- Determine app user id from auth.uid()
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO current_user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
  END IF;

  -- Publish: make visible to responders for all orgs in this tenant matching assigned subtypes
  IF TG_OP IN ('INSERT','UPDATE') AND NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Update existing visibility
    UPDATE public.organization_report_settings ors
    SET visible_to_responders = TRUE,
        updated_at = now()
    WHERE ors.tenant_id = NEW.tenant_id
      AND ors.template_id = NEW.id;

    -- Insert missing visibility rows for matching orgs by subtype assignments
    INSERT INTO public.organization_report_settings (tenant_id, organization_id, template_id, visible_to_responders, created_by)
    SELECT NEW.tenant_id, o.id, NEW.id, TRUE, current_user_id
    FROM public.organizations o
    WHERE o.tenant_id = NEW.tenant_id
      AND EXISTS (
        SELECT 1
        FROM public.platform_assignments pa
        WHERE pa.tenant_id = NEW.tenant_id
          AND pa.element_type = 'report_template'
          AND pa.target_type = 'organization_type'
          AND pa.element_id = NEW.id
          AND pa.target_organization_type = o.organization_type
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.organization_report_settings ors2
        WHERE ors2.tenant_id = NEW.tenant_id
          AND ors2.organization_id = o.id
          AND ors2.template_id = NEW.id
      );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status = 'unpublished' THEN
    -- Unpublish: hide from responders but keep subtype assignments intact
    UPDATE public.organization_report_settings ors
    SET visible_to_responders = FALSE,
        updated_at = now()
    WHERE ors.tenant_id = NEW.tenant_id
      AND ors.template_id = NEW.id;
  END IF;

  -- Audit log entry for any status change
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs (
      id, tenant_id, user_id, action, resource_type, resource_id, metadata, created_at
    ) VALUES (
      gen_random_uuid(),
      NEW.tenant_id,
      current_user_id,
      'report_template_status_change',
      'report_template',
      NEW.id::text,
      jsonb_build_object('from', OLD.status, 'to', NEW.status),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_report_templates_apply_status ON public.report_templates;
CREATE TRIGGER trg_report_templates_apply_status
AFTER INSERT OR UPDATE OF status ON public.report_templates
FOR EACH ROW EXECUTE FUNCTION public.apply_report_template_status_effects();


