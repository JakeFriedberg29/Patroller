# Troubleshooting Guide: Reports Not Showing for Beaver Creek

## Quick Start: Most Common Issue

### Are you on the correct page?

There are **TWO different "Reports" pages** in the system:

1. **❌ WRONG:** `/reports` - Shows hardcoded static templates (Platform Admin view)
2. **✅ CORRECT:** `/organization/{beaver-creek-id}/reports` - Shows dynamic templates from database

**To find the correct URL:**
1. Run `find_beaver_creek_url.sql` in Supabase SQL Editor
2. Copy the URL from the results
3. Paste it in your browser

---

## Step-by-Step Fix Process

### Step 1: Apply Database Migration ✅

The migration file exists but needs to be applied to your database.

**If using Supabase CLI:**
```bash
cd /Users/Jake/repos/Patroller
supabase db push
```

**If using Supabase Dashboard:**
1. Go to Supabase Dashboard → SQL Editor
2. Open: `/Users/Jake/repos/Patroller/supabase/migrations/20251021000000_fix_cross_tenant_report_propagation.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"

**Verify it worked:**
Run this query:
```sql
SELECT 
  routine_name,
  SUBSTRING(routine_definition FROM 1 FOR 100) as first_100_chars
FROM information_schema.routines
WHERE routine_name = 'apply_report_template_status_effects';
```
Should show the function with text starting with "declare current_user_id uuid"

---

### Step 2: Re-Create Assignments

Even though you previously assigned "Incident Report" to "Ski Resorts", you need to **re-save it** to trigger the new cross-tenant logic.

**Instructions:**
1. Log in as **Platform Admin**
2. Navigate to `/repository`
3. Find "Incident Report" in the list
4. Click the **"Assign Subtypes"** button
5. **Uncheck** "Ski Resorts" (if checked)
6. Click **"Save Assignments"**
7. Click **"Assign Subtypes"** again
8. **Check** "Ski Resorts"
9. Click **"Save Assignments"**

**What happens behind the scenes:**
- System finds ALL enterprises with organizations having "Ski Resorts" subtype
- Creates `repository_assignments` row for Beaver Creek's enterprise
- Creates rows for any other enterprise with "Ski Resorts" orgs

**Verify it worked:**
```sql
-- Should show multiple tenants, including Beaver Creek's enterprise
SELECT 
  e.name as enterprise,
  os.name as subtype,
  ra.created_at
FROM repository_assignments ra
JOIN enterprises e ON ra.tenant_id = e.id
JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
WHERE ra.element_type = 'report_template'
  AND os.name ILIKE '%ski%resort%'
ORDER BY ra.created_at DESC;
```

---

### Step 3: Publish the Report

The report must be in "published" status to be visible to organizations.

**Instructions:**
1. Still on `/repository` page as Platform Admin
2. Find "Incident Report"
3. In the Status column, click the dropdown
4. Select **"Published"**

**What happens behind the scenes:**
- Trigger fires: `apply_report_template_status_effects`
- Creates `patroller_report_visibility` records for ALL orgs with "Ski Resorts" subtype
- Sets `visible_to_patrollers = true`

**Verify it worked:**
```sql
-- Should show Beaver Creek organization
SELECT 
  o.name as organization,
  e.name as enterprise,
  prv.visible_to_patrollers,
  prv.created_at
FROM patroller_report_visibility prv
JOIN organizations o ON prv.organization_id = o.id
JOIN enterprises e ON o.tenant_id = e.id
WHERE o.name ILIKE '%beaver%creek%';
```

---

### Step 4: Navigate to Correct URL

**Don't use:** `/reports` (shows static templates)
**Do use:** `/organization/{beaver-creek-id}/reports`

**Find the correct URL:**
Run `find_beaver_creek_url.sql` or this query:
```sql
SELECT '/organization/' || id || '/reports' as url
FROM organizations
WHERE name ILIKE '%beaver%creek%';
```

---

### Step 5: Check the Report Shows Up

On the correct URL, you should see:
- **Templates Tab**: Lists all published templates assigned to "Ski Resorts" subtype
- "Incident Report" should appear in the list
- Clicking on it should allow creating a new report

---

## Common Issues and Solutions

### Issue: "No templates found"

**Possible Causes:**
1. ❌ Migration not applied → Go back to Step 1
2. ❌ Assignment not re-saved → Go back to Step 2
3. ❌ Template not published → Go back to Step 3
4. ❌ Wrong URL → Go back to Step 4
5. ❌ Subtype mismatch → See below

**Subtype Mismatch:**
If Beaver Creek's subtype doesn't exactly match what you assigned:

```sql
-- Check Beaver Creek's actual subtype
SELECT organization_subtype
FROM organizations
WHERE name ILIKE '%beaver%creek%';

-- If different, update the assignment to use the correct subtype
-- Or change Beaver Creek's subtype to match
```

---

### Issue: Template shows but visibility toggle doesn't work

**Cause:** Visibility records exist but set to `false`

**Fix:**
```sql
-- Check visibility
SELECT visible_to_patrollers
FROM patroller_report_visibility
WHERE organization_id = (
  SELECT id FROM organizations WHERE name ILIKE '%beaver%creek%' LIMIT 1
);

-- If false, toggle to true in the UI or via SQL:
UPDATE patroller_report_visibility
SET visible_to_patrollers = true
WHERE organization_id = (
  SELECT id FROM organizations WHERE name ILIKE '%beaver%creek%' LIMIT 1
);
```

---

### Issue: Multiple enterprises, but only one has the assignment

**Cause:** Subtype doesn't exist in `organization_subtypes` table for that enterprise

**Fix:**
The assignment creation process should auto-create subtypes, but if it doesn't:

```sql
-- Check which enterprises have the subtype registered
SELECT e.name, os.name
FROM organization_subtypes os
JOIN enterprises e ON os.tenant_id = e.id
WHERE os.name ILIKE '%ski%resort%';

-- If Beaver Creek's enterprise is missing, manually insert:
INSERT INTO organization_subtypes (tenant_id, name)
SELECT tenant_id, 'Ski Resorts'
FROM organizations
WHERE name ILIKE '%beaver%creek%'
ON CONFLICT (tenant_id, name) DO NOTHING;
```

Then re-save the assignment (Step 2).

---

## Verification Checklist

Before contacting support, verify:

- ✅ Migration applied (checked via SQL)
- ✅ Looking at `/organization/{id}/reports` not `/reports`
- ✅ Beaver Creek organization exists with correct subtype
- ✅ Assignment exists for Beaver Creek's tenant_id
- ✅ Template status is "published"
- ✅ Visibility record exists for Beaver Creek's organization_id
- ✅ `visible_to_patrollers` is `true`
- ✅ Browser cache cleared / hard refresh (Cmd+Shift+R)

---

## Debug Output Script

Run this and share the output if still having issues:

```sql
WITH incident_report AS (
  SELECT id, name, tenant_id, status
  FROM report_templates
  WHERE name ILIKE '%incident%'
    AND organization_id IS NULL
  LIMIT 1
),
beaver_creek AS (
  SELECT o.id, o.name, o.organization_subtype, o.tenant_id, e.name as enterprise_name
  FROM organizations o
  LEFT JOIN enterprises e ON o.tenant_id = e.id
  WHERE o.name ILIKE '%beaver%creek%'
  LIMIT 1
)
SELECT 
  '1. Template Found' as check_step,
  ir.name as template_name,
  ir.status,
  CASE WHEN ir.id IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END as result
FROM incident_report ir
UNION ALL
SELECT 
  '2. Organization Found',
  bc.name,
  bc.organization_subtype,
  CASE WHEN bc.id IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END
FROM beaver_creek bc
UNION ALL
SELECT 
  '3. Assignment Exists for BC Tenant',
  COUNT(*)::text || ' assignments',
  os.name,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM incident_report ir
CROSS JOIN beaver_creek bc
LEFT JOIN repository_assignments ra ON 
  ra.element_id = ir.id 
  AND ra.tenant_id = bc.tenant_id
  AND ra.element_type = 'report_template'
LEFT JOIN organization_subtypes os ON ra.target_organization_subtype_id = os.id
GROUP BY os.name
UNION ALL
SELECT 
  '4. Visibility Record Exists',
  COALESCE(prv.visible_to_patrollers::text, 'no record'),
  NULL,
  CASE WHEN prv.id IS NOT NULL THEN '✅ PASS' ELSE '❌ FAIL' END
FROM incident_report ir
CROSS JOIN beaver_creek bc
LEFT JOIN patroller_report_visibility prv ON 
  prv.template_id = ir.id 
  AND prv.organization_id = bc.id
UNION ALL
SELECT 
  '5. Correct URL',
  '/organization/' || bc.id || '/reports',
  NULL,
  '📋 USE THIS URL'
FROM beaver_creek bc;
```

---

## Expected Results After Fix

After completing all steps, you should see:

1. **Platform Admin → Repository:**
   - "Incident Report" shows "1" or more in "Subtypes assigned" column
   - Status is "Published"

2. **Beaver Creek → Reports Page:**
   - URL is `/organization/{beaver-creek-id}/reports`
   - Templates tab shows "Incident Report"
   - Can click to create new report

3. **Database State:**
   - `repository_assignments`: Row exists for Beaver Creek's tenant_id
   - `patroller_report_visibility`: Row exists for Beaver Creek's organization_id with `visible_to_patrollers = true`

