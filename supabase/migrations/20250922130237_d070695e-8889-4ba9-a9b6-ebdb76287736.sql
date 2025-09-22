-- Add backend validation for report template deletion
-- Only allow deletion of draft or unpublished reports

CREATE OR REPLACE FUNCTION public.validate_report_template_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status allows deletion
  IF OLD.status NOT IN ('draft', 'unpublished') THEN
    RAISE EXCEPTION 'Cannot delete report template with status %', OLD.status
      USING ERRCODE = '23514';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce deletion rules
CREATE TRIGGER validate_report_template_deletion_trigger
  BEFORE DELETE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_report_template_deletion();

-- Update the existing delete trigger to ensure it runs after validation
DROP TRIGGER IF EXISTS on_report_template_deleted_trigger ON public.report_templates;
CREATE TRIGGER on_report_template_deleted_trigger
  AFTER DELETE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.on_report_template_deleted();