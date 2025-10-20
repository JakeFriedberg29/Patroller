# Diagnostic Queries for Report Propagation Issue

Run these queries in your Supabase SQL Editor to diagnose the issue:

## 1. Check if migration was applied

```sql
-- Check if the new trigger function exists with the correct logic
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'apply_report_template_status_effects';
```

**Expected:** Should show the updated function with cross-tenant logic.

---

## 2. Find your "Incident Report" template

```sql
-- Find the report template
SELECT id, name, tenant_id, organization_id, status
FROM report_templates
WHERE name ILIKE '%incident%'
  AND organization_id IS NULL  -- Platform-level templates
ORDER BY created_at DESC;
```

**Note the `id` and `tenant_id`** - you'll need these for the next queries.

---

## 3. Check repository assignments for "Incident Report"

Replace `<template-id>` with the ID from query #2:

```sql
-- Check assignments across all tenants
SELECT 
  ra.tenant_id,
  e.name as enterprise_name,
  ra.element_id,
  ra.target_type,
  ra.target_organization_subtype_id,
  os.name as subtype_name
FROM repository_assignments ra
JOIN enterprises e ON ra.tenant_id = e.id
LEFT JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
WHERE ra.element_type = 'report_template'
  AND ra.element_id = '<template-id>';
```

**Expected:** Should show rows for EVERY enterprise that has organizations with "Ski Resorts" subtype.
**Problem if:** Only shows one row (platform tenant) or no rows.

---

## 4. Find "Beaver Creek" organization

```sql
-- Find the Beaver Creek organization
SELECT 
  o.id,
  o.name,
  o.organization_subtype,
  o.tenant_id,
  e.name as enterprise_name
FROM organizations o
LEFT JOIN enterprises e ON o.tenant_id = e.id
WHERE o.name ILIKE '%beaver%creek%';
```

**Note the `organization_subtype`** - should be "Ski Resorts" or similar.

---

## 5. Check if assignment exists for Beaver Creek's tenant

Replace values from queries above:

```sql
-- Check if assignment exists for Beaver Creek's tenant
SELECT 
  ra.*,
  os.name as subtype_name
FROM repository_assignments ra
LEFT JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
WHERE ra.element_type = 'report_template'
  AND ra.element_id = '<template-id-from-query-2>'
  AND ra.tenant_id = '<beaver-creek-tenant-id-from-query-4>';
```

**Expected:** Should show a row with the matching subtype.
**Problem if:** No rows found - assignment wasn't created for this tenant.

---

## 6. Check visibility records

```sql
-- Check if visibility record was created when published
SELECT 
  prv.*,
  o.name as org_name,
  e.name as enterprise_name
FROM patroller_report_visibility prv
JOIN organizations o ON prv.organization_id = o.id
JOIN enterprises e ON o.tenant_id = e.id
WHERE prv.template_id = '<template-id>';
```

**Alternative table name if above fails:**
```sql
SELECT 
  ors.*,
  o.name as org_name,
  e.name as enterprise_name
FROM organization_report_settings ors
JOIN organizations o ON ors.organization_id = o.id
JOIN enterprises e ON o.tenant_id = e.id
WHERE ors.template_id = '<template-id>';
```

**Expected:** Should show rows for ALL organizations with the assigned subtype across ALL tenants.
**Problem if:** No rows or missing Beaver Creek's organization.

---

## 7. Check organization subtypes catalog

```sql
-- Check what subtypes are registered for each tenant
SELECT 
  e.name as enterprise,
  os.name as subtype,
  os.is_active
FROM organization_subtypes os
JOIN enterprises e ON os.tenant_id = e.id
WHERE os.name ILIKE '%ski%'
ORDER BY e.name, os.name;
```

**Expected:** "Ski Resorts" subtype should exist for Beaver Creek's enterprise.

---

## Quick All-in-One Diagnostic

Replace `<template-name>` and `<org-name>`:

```sql
WITH 
template_info AS (
  SELECT id, name, tenant_id, status
  FROM report_templates
  WHERE name ILIKE '%<template-name>%'
    AND organization_id IS NULL
  LIMIT 1
),
org_info AS (
  SELECT o.id, o.name, o.organization_subtype, o.tenant_id,
         e.name as enterprise_name
  FROM organizations o
  LEFT JOIN enterprises e ON o.tenant_id = e.id
  WHERE o.name ILIKE '%<org-name>%'
  LIMIT 1
)
SELECT 
  'Template' as type,
  t.name as name,
  t.status,
  t.tenant_id as tenant_id,
  NULL as subtype
FROM template_info t
UNION ALL
SELECT 
  'Organization' as type,
  o.name,
  NULL,
  o.tenant_id,
  o.organization_subtype
FROM org_info o
UNION ALL
SELECT 
  'Assignment for Org Tenant' as type,
  os.name,
  NULL,
  ra.tenant_id,
  os.name
FROM template_info t
CROSS JOIN org_info o
LEFT JOIN repository_assignments ra ON 
  ra.element_id = t.id 
  AND ra.tenant_id = o.tenant_id
  AND ra.element_type = 'report_template'
LEFT JOIN organization_subtypes os ON 
  ra.target_organization_subtype_id = os.id
UNION ALL
SELECT 
  'Visibility Record' as type,
  'visible: ' || prv.visible_to_patrollers::text,
  NULL,
  prv.tenant_id,
  NULL
FROM template_info t
CROSS JOIN org_info o
LEFT JOIN patroller_report_visibility prv ON 
  prv.template_id = t.id 
  AND prv.organization_id = o.id;
```

---

## Most Likely Issues and Fixes

### Issue 1: Migration Not Applied
**Symptom:** Query #1 shows old function code.
**Fix:** Apply the migration:
```bash
# If using local Supabase
supabase db push

# Or manually run the migration SQL in Supabase dashboard
```

### Issue 2: Assignments Not Created Cross-Tenant
**Symptom:** Query #3 only shows platform tenant, not Beaver Creek's tenant.
**Fix:** Re-save the assignment in the UI:
1. Go to `/repository` as Platform Admin
2. Click "Assign Subtypes" on the Incident Report
3. Uncheck "Ski Resorts", Save
4. Check "Ski Resorts" again, Save
5. This will trigger the new cross-tenant logic

### Issue 3: Template Not Published
**Symptom:** Query #2 shows status != 'published'
**Fix:** Set status to Published in Repository page

### Issue 4: Visibility Records Not Created
**Symptom:** Query #6 shows no rows or missing Beaver Creek
**Fix:** 
- If migration applied: Toggle status Unpublished → Published
- If migration not applied: Apply migration first, then toggle status

### Issue 5: Wrong Route
**Symptom:** Looking at `/reports` instead of `/organization/{id}/reports`
**Fix:** Navigate to `/organization/<beaver-creek-id>/reports`

### Issue 6: Subtype Not in Catalog
**Symptom:** Query #7 doesn't show "Ski Resorts" for Beaver Creek's enterprise
**Fix:** The subtype must exist in `organization_subtypes` table for that tenant.
- Option A: Go to Repository, assign the subtype (will auto-create)
- Option B: Manually insert into `organization_subtypes` table

