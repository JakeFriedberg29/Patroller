-- DETAILED DIAGNOSTIC FOR REPORT PROPAGATION ISSUE
-- Run this entire script in Supabase SQL Editor

\echo '========================================='
\echo 'DIAGNOSTIC: Report Propagation Issue'
\echo '========================================='
\echo ''

-- Step 1: Find the template
\echo '1. FINDING INCIDENT REPORT TEMPLATE:'
SELECT 
  id as template_id,
  name,
  tenant_id as template_tenant_id,
  status,
  organization_id
FROM report_templates
WHERE name ILIKE '%incident%report%'
  AND organization_id IS NULL
ORDER BY created_at DESC
LIMIT 3;

\echo ''
\echo '2. FINDING BEAVER CREEK ORGANIZATION:'
-- Step 2: Find Beaver Creek
SELECT 
  id as org_id,
  name,
  organization_subtype,
  tenant_id as org_tenant_id
FROM organizations
WHERE name ILIKE '%beaver%creek%'
LIMIT 1;

\echo ''
\echo '3. CHECKING IF SUBTYPE EXISTS IN ORG TENANT:'
-- Step 3: Check if Ski Resorts subtype exists for Beaver Creek's tenant
SELECT 
  os.id as subtype_id,
  os.name as subtype_name,
  os.tenant_id,
  e.name as enterprise_name
FROM organizations o
JOIN organization_subtypes os ON os.tenant_id = o.tenant_id
LEFT JOIN enterprises e ON os.tenant_id = e.id
WHERE o.name ILIKE '%beaver%creek%'
  AND os.name ILIKE '%ski%resort%';

\echo ''
\echo '4. CHECKING ALL ASSIGNMENTS FOR THIS TEMPLATE:'
-- Step 4: Check ALL assignments
SELECT 
  ra.id,
  ra.tenant_id as assignment_tenant_id,
  e.name as enterprise,
  ra.target_organization_subtype_id,
  os.name as subtype_name,
  ra.created_at
FROM report_templates rt
JOIN repository_assignments ra ON ra.element_id = rt.id
LEFT JOIN enterprises e ON ra.tenant_id = e.id
LEFT JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
WHERE rt.name ILIKE '%incident%report%'
  AND rt.organization_id IS NULL
  AND ra.element_type = 'report_template';

\echo ''
\echo '5. CHECKING IF ASSIGNMENT EXISTS FOR BEAVER CREEK TENANT:'
-- Step 5: Check if assignment exists for Beaver Creek's tenant specifically
SELECT 
  'Assignment exists for BC tenant' as check_result,
  ra.id,
  ra.tenant_id,
  os.name as assigned_subtype
FROM organizations o
JOIN repository_assignments ra ON ra.tenant_id = o.tenant_id
JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
JOIN report_templates rt ON rt.id = ra.element_id
WHERE o.name ILIKE '%beaver%creek%'
  AND rt.name ILIKE '%incident%report%'
  AND rt.organization_id IS NULL
  AND ra.element_type = 'report_template';

\echo ''
\echo '6. CHECKING VISIBILITY RECORDS:'
-- Step 6: Check visibility
SELECT 
  'Visibility record' as check_result,
  prv.id,
  prv.organization_id,
  o.name as org_name,
  prv.visible_to_patrollers,
  prv.created_at
FROM organizations o
LEFT JOIN patroller_report_visibility prv ON prv.organization_id = o.id
LEFT JOIN report_templates rt ON rt.id = prv.template_id
WHERE o.name ILIKE '%beaver%creek%'
  AND rt.name ILIKE '%incident%report%';

\echo ''
\echo '7. SIMULATING THE QUERY LOGIC:'
-- Step 7: Simulate what the frontend query does
WITH beaver_creek AS (
  SELECT id, organization_subtype, tenant_id
  FROM organizations
  WHERE name ILIKE '%beaver%creek%'
  LIMIT 1
),
subtype_lookup AS (
  SELECT os.id as subtype_id
  FROM beaver_creek bc
  JOIN organization_subtypes os ON os.tenant_id = bc.tenant_id AND os.name = bc.organization_subtype
),
found_assignments AS (
  SELECT ra.element_id as template_id
  FROM beaver_creek bc
  JOIN repository_assignments ra ON ra.tenant_id = bc.tenant_id
  JOIN subtype_lookup sl ON ra.target_organization_subtype_id = sl.subtype_id
  WHERE ra.element_type = 'report_template'
    AND ra.target_type = 'organization_type'
)
SELECT 
  'Frontend would find these templates' as result,
  rt.id,
  rt.name,
  rt.status
FROM found_assignments fa
JOIN report_templates rt ON rt.id = fa.template_id
WHERE rt.status = 'published'
  AND rt.organization_id IS NULL;

\echo ''
\echo '========================================='
\echo 'END DIAGNOSTIC'
\echo '========================================='
