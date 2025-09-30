-- Add 'archive' status to report_template_status enum and update transition rules

-- 1) Add 'archive' to the enum
ALTER TYPE public.report_template_status ADD VALUE IF NOT EXISTS 'archive';

-- 2) Update the transition enforcement function to allow transitions to 'archive'
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
  -- draft -> draft|ready|archive
  -- ready -> ready|draft|published|archive
  -- published -> published|unpublished
  -- unpublished -> unpublished|ready|draft|archive
  -- archive -> archive (cannot transition out of archive)
  IF OLD.status = 'draft' AND NEW.status NOT IN ('draft','ready','archive') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'ready' AND NEW.status NOT IN ('ready','draft','published','archive') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'published' AND NEW.status NOT IN ('published','unpublished') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'unpublished' AND NEW.status NOT IN ('unpublished','ready','draft','archive') THEN
    allowed := FALSE;
  ELSIF OLD.status = 'archive' AND NEW.status NOT IN ('archive') THEN
    allowed := FALSE;
  END IF;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Update the apply_report_template_status_effects function to handle archive status
-- Archive status should not affect visibility (no publish/unpublish side effects)
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
