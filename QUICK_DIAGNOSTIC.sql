-- QUICK DIAGNOSTIC: Run this ONE query in Supabase SQL Editor
-- Copy ALL the output and share with me

WITH 
-- Find the Incident Report template
template AS (
  SELECT id, name, tenant_id, status
  FROM report_templates
  WHERE name ILIKE '%incident%report%'
    AND organization_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1
),
-- Find Beaver Creek organization
org AS (
  SELECT 
    id as org_id,
    name as org_name,
    organization_subtype,
    tenant_id as org_tenant_id
  FROM organizations
  WHERE name ILIKE '%beaver%creek%'
  LIMIT 1
),
-- Check if subtype exists for this tenant
subtype_check AS (
  SELECT 
    os.id as subtype_id,
    os.name as subtype_name,
    os.tenant_id
  FROM org o
  LEFT JOIN organization_subtypes os ON 
    os.tenant_id = o.org_tenant_id 
    AND os.name = o.organization_subtype
),
-- Check if assignment exists
assignment_check AS (
  SELECT 
    ra.id as assignment_id,
    ra.tenant_id,
    ra.target_organization_subtype_id
  FROM template t
  CROSS JOIN org o
  CROSS JOIN subtype_check sc
  LEFT JOIN repository_assignments ra ON 
    ra.element_id = t.id
    AND ra.tenant_id = o.org_tenant_id
    AND ra.element_type = 'report_template'
    AND ra.target_organization_subtype_id = sc.subtype_id
),
-- Check visibility
visibility_check AS (
  SELECT 
    prv.id as visibility_id,
    prv.visible_to_patrollers
  FROM template t
  CROSS JOIN org o
  LEFT JOIN patroller_report_visibility prv ON 
    prv.template_id = t.id
    AND prv.organization_id = o.org_id
)
-- Show results
SELECT 
  '1. Template' as check_item,
  CASE 
    WHEN t.id IS NOT NULL THEN '✅ FOUND: ' || t.name || ' (status: ' || t.status || ')'
    ELSE '❌ NOT FOUND'
  END as status,
  t.id as detail_id
FROM template t
UNION ALL
SELECT 
  '2. Organization',
  CASE 
    WHEN o.org_id IS NOT NULL THEN '✅ FOUND: ' || o.org_name || ' (subtype: ' || COALESCE(o.organization_subtype, 'NULL') || ')'
    ELSE '❌ NOT FOUND'
  END,
  o.org_id
FROM org o
UNION ALL
SELECT 
  '3. Subtype in Catalog',
  CASE 
    WHEN sc.subtype_id IS NOT NULL THEN '✅ FOUND: ' || sc.subtype_name || ' in tenant'
    ELSE '❌ NOT FOUND - Subtype not in organization_subtypes for this tenant!'
  END,
  sc.subtype_id
FROM subtype_check sc
UNION ALL
SELECT 
  '4. Repository Assignment',
  CASE 
    WHEN ac.assignment_id IS NOT NULL THEN '✅ FOUND: Assignment exists'
    ELSE '❌ NOT FOUND - No assignment for this tenant!'
  END,
  ac.assignment_id
FROM assignment_check ac
UNION ALL
SELECT 
  '5. Visibility Record',
  CASE 
    WHEN vc.visibility_id IS NOT NULL AND vc.visible_to_patrollers THEN '✅ FOUND: Visible to patrollers'
    WHEN vc.visibility_id IS NOT NULL AND NOT vc.visible_to_patrollers THEN '⚠️ FOUND but HIDDEN'
    ELSE '❌ NOT FOUND - No visibility record!'
  END,
  vc.visibility_id
FROM visibility_check vc;

-- Also show the actual values for debugging
SELECT '=== ACTUAL VALUES ===' as section;
SELECT 'Template:' as label, id, name, status, tenant_id FROM template;
SELECT 'Organization:' as label, org_id as id, org_name as name, organization_subtype, org_tenant_id as tenant_id FROM org;
SELECT 'Subtype in Catalog:' as label, subtype_id as id, subtype_name as name, tenant_id FROM subtype_check;

