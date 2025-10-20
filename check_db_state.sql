-- Check 1: Find Incident Report template
SELECT 'TEMPLATE CHECK' as step, id, name, tenant_id, organization_id, status
FROM report_templates
WHERE name ILIKE '%incident%'
  AND organization_id IS NULL
LIMIT 1;

-- Check 2: Find Beaver Creek organization
SELECT 'ORGANIZATION CHECK' as step, o.id, o.name, o.organization_subtype, o.tenant_id, e.name as enterprise_name
FROM organizations o
LEFT JOIN enterprises e ON o.tenant_id = e.id
WHERE o.name ILIKE '%beaver%creek%'
LIMIT 1;

-- Check 3: Find all repository assignments for incident report
SELECT 'ASSIGNMENTS CHECK' as step, 
  ra.tenant_id, 
  e.name as enterprise,
  ra.target_organization_subtype_id,
  os.name as subtype_name
FROM repository_assignments ra
JOIN enterprises e ON ra.tenant_id = e.id
LEFT JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
WHERE ra.element_type = 'report_template'
  AND ra.element_id IN (
    SELECT id FROM report_templates 
    WHERE name ILIKE '%incident%' AND organization_id IS NULL
  );

-- Check 4: Find visibility records
SELECT 'VISIBILITY CHECK' as step, 
  prv.organization_id,
  o.name as org_name,
  prv.visible_to_patrollers,
  prv.tenant_id
FROM patroller_report_visibility prv
JOIN organizations o ON prv.organization_id = o.id
WHERE prv.template_id IN (
  SELECT id FROM report_templates 
  WHERE name ILIKE '%incident%' AND organization_id IS NULL
)
AND o.name ILIKE '%beaver%creek%';
