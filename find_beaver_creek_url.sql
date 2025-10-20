-- Quick query to find the correct URL for Beaver Creek reports page
-- Run this in Supabase SQL Editor, then use the URL in your browser

SELECT 
  '/organization/' || o.id || '/reports' as correct_url,
  o.id as organization_id,
  o.name as organization_name,
  o.organization_subtype,
  e.name as enterprise_name,
  o.tenant_id
FROM organizations o
LEFT JOIN enterprises e ON o.tenant_id = e.id
WHERE o.name ILIKE '%beaver%creek%'
LIMIT 1;

-- Example output:
-- correct_url: /organization/abc-123-def-456/reports
-- Copy the correct_url value and paste it into your browser's address bar

