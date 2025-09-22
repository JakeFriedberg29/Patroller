-- Update the report template status transition function to match new business rules
-- New rules: no staying in same status, only transitions to different states
-- Draft → Ready, Published
-- Ready → Draft, Published
-- Published → Unpublished, Ready, Draft
-- Unpublished → Draft, Ready, Published

CREATE OR REPLACE FUNCTION public.enforce_report_template_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  allowed BOOLEAN := FALSE;
BEGIN
  -- Allow inserts with any status
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- If status hasn't changed, allow the update
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- New transition rules (no staying in same status):
  -- draft -> ready|published
  -- ready -> draft|published
  -- published -> unpublished|ready|draft  
  -- unpublished -> draft|ready|published
  
  IF OLD.status = 'draft' AND NEW.status IN ('ready','published') THEN
    allowed := TRUE;
  ELSIF OLD.status = 'ready' AND NEW.status IN ('draft','published') THEN
    allowed := TRUE;
  ELSIF OLD.status = 'published' AND NEW.status IN ('unpublished','ready','draft') THEN
    allowed := TRUE;
  ELSIF OLD.status = 'unpublished' AND NEW.status IN ('draft','ready','published') THEN
    allowed := TRUE;
  END IF;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$function$;