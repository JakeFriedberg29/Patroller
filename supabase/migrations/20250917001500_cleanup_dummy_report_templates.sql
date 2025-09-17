-- Cleanup dummy report templates that were seeded per-organization
-- Keep only repository-created (platform-scoped) templates

BEGIN;

DELETE FROM public.report_templates
WHERE organization_id IS NOT NULL;

COMMIT;


