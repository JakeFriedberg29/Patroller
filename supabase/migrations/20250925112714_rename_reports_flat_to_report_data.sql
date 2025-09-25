-- Rename reports_flat view to report_data
-- Drop the old view
DROP VIEW IF EXISTS public.reports_flat;

-- Create the new view with the updated name
CREATE VIEW public.report_data AS
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

-- Add comment for documentation
COMMENT ON VIEW public.report_data IS 'Flattened view of reports table for analytics and UI queries, extracting common fields from metadata JSONB';
