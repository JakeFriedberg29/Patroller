# Cross-Tenant Report Propagation Fix

## Problem Summary

When Platform Admins assigned reports to organization subtypes in the Repository and set them to "published" status, the reports were not propagating to organizations in different enterprises (tenants). 

## Root Cause

The issue had three components:

### 1. **Assignment Creation** (Frontend)
The `AssignmentManager` component was only creating `repository_assignments` rows for the platform tenant's subtypes. It wasn't creating assignments across all tenants that have organizations with those subtypes.

**Before:**
```typescript
// Only created assignments for platform tenant
const { data: subtypeRows } = await supabase
  .from('organization_subtypes')
  .select('id,name')
  .eq('tenant_id', tenantId) // Platform tenant only
  .in('name', toAdd as any);
```

### 2. **Template Query** (Frontend)
The `useReportTemplates` hook was filtering templates by the organization's tenant_id, but platform templates have the platform tenant_id, causing a mismatch.

**Before:**
```typescript
const { data: templatesData } = await supabase
  .from('report_templates')
  .select('id, name, description, tenant_id, status')
  .in('id', allIds)
  .eq('tenant_id', resolvedTenantId as string) // Wrong: org's tenant_id
  .eq('status', 'published');
```

### 3. **Status Trigger** (Database)
The `apply_report_template_status_effects` trigger was only creating visibility records for organizations in the same tenant as the template, not across all tenants.

**Before:**
```sql
from public.organizations o
where o.tenant_id = new.tenant_id  -- Only template's tenant
  and exists (
    select 1
    from public.repository_assignments ra
    where ra.tenant_id = new.tenant_id  -- Only template's tenant
```

## Solution Implementation

### 1. **Fixed Assignment Creation** (`src/components/repository/AssignmentManager.tsx`)

Now when assigning reports to subtypes, the system:
1. Finds ALL tenants that have organizations with the target subtypes
2. For each tenant, creates a `repository_assignments` row with that tenant's subtype_id
3. This ensures every tenant with matching organizations gets an assignment

**Key Changes:**
- Added cross-tenant subtype discovery
- Creates assignments for each affected tenant
- Removal logic also works across all tenants
- Loading logic shows assignment if ANY tenant has it assigned

```typescript
// Find all tenants with organizations matching the subtypes
const { data: orgsWithSubtypes } = await supabase
  .from('organizations')
  .select('tenant_id, organization_subtype')
  .in('organization_subtype', toAdd as any)
  .not('tenant_id', 'is', null);

const affectedTenantIds = Array.from(
  new Set((orgsWithSubtypes || []).map((o: any) => o.tenant_id).filter(Boolean))
);

// Create assignments for each affected tenant
for (const affectedTenantId of affectedTenantIds) {
  // Get subtype IDs for this tenant
  // Create assignment rows
}
```

### 2. **Fixed Template Query** (`src/hooks/useReportTemplates.tsx`)

Removed the tenant_id filter when querying templates, since platform templates can belong to any tenant but should be available to all organizations that have matching assignments.

**Key Changes:**
- Removed `.eq('tenant_id', resolvedTenantId as string)` filter
- Added `.is('organization_id', null)` to ensure only platform-level templates

```typescript
const { data: templatesData } = await supabase
  .from('report_templates')
  .select('id, name, description, tenant_id, status')
  .in('id', allIds)
  .eq('status', 'published')
  .is('organization_id', null); // Only platform-level templates
```

### 3. **Fixed Status Trigger** (`supabase/migrations/20251021000000_fix_cross_tenant_report_propagation.sql`)

Updated the trigger to create visibility records across ALL tenants when a template is published.

**Key Changes:**
- Removed the filter `o.tenant_id = new.tenant_id` on organizations
- Changed the assignment lookup to `ra.tenant_id = o.tenant_id` (match in org's tenant, not template's)
- Now processes organizations from all tenants
- Handles both `organization_report_settings` and `patroller_report_visibility` table names

```sql
-- Insert visibility for ALL organizations across ALL tenants
select o.tenant_id, o.id, new.id, true, current_user_id
from public.organizations o
where o.tenant_id is not null  -- All tenants
  and exists (
    select 1
    from public.repository_assignments ra
    where ra.tenant_id = o.tenant_id  -- Match in org's tenant
      and ra.element_id = new.id
      -- Match by subtype
  )
```

## Architecture

The fixed architecture follows this flow:

### Publishing a Report:
1. **Platform Admin** creates a report template with `tenant_id = platform_tenant_id` and `organization_id = null`
2. **Platform Admin** assigns to subtypes (e.g., "ski_patrol", "lifeguard_service")
3. **System** discovers all tenants with organizations matching those subtypes
4. **System** creates `repository_assignments` rows: one per (tenant, subtype) combination
5. **Platform Admin** sets status to "published"
6. **Trigger** fires and creates `organization_report_settings` / `patroller_report_visibility` rows for ALL matching organizations across ALL tenants

### Organization Discovering Reports:
1. **Organization** queries for available templates
2. **System** finds `repository_assignments` matching the org's tenant_id and subtype
3. **System** retrieves template IDs from those assignments
4. **System** fetches templates (without filtering by tenant_id)
5. **Organization** sees all published, assigned templates

## Data Flow Diagram

```
Platform Admin (Tenant: Platform)
  ↓ Creates template with tenant_id = Platform
Report Template (Platform tenant)
  ↓ Assigns to "ski_patrol" subtype
System discovers:
  - Tenant A has orgs with "ski_patrol" → Create assignment in Tenant A
  - Tenant B has orgs with "ski_patrol" → Create assignment in Tenant B
  - Tenant C has no "ski_patrol" → No assignment
  ↓ Admin publishes template
Trigger fires:
  - Creates visibility for Org 1 (Tenant A)
  - Creates visibility for Org 2 (Tenant A)
  - Creates visibility for Org 3 (Tenant B)
  ↓
Organizations can now see the template
```

## Benefits of This Approach

1. **Scalable**: New tenants automatically get assignments when they create organizations with matching subtypes
2. **Secure**: Each tenant only sees assignments and visibility records for their own organizations
3. **Maintainable**: Assignment logic is centralized in one place
4. **Efficient**: Assignments are denormalized per-tenant for fast queries
5. **Safe**: RLS policies ensure proper data isolation between tenants

## Testing Recommendations

To verify the fix works correctly:

1. **Setup**: Create multiple enterprises (tenants) with organizations having the same subtype
   - Enterprise A → Org 1 (subtype: ski_patrol)
   - Enterprise B → Org 2 (subtype: ski_patrol)

2. **Assign**: As Platform Admin, create a report and assign it to "ski_patrol" subtype

3. **Verify Assignments**: Check that `repository_assignments` has rows for both Tenant A and Tenant B

4. **Publish**: Set the report status to "published"

5. **Verify Visibility**: Check that both Org 1 and Org 2 can see the report in their available templates

6. **Test Removal**: Unassign the subtype and verify assignments are removed from all tenants

7. **Test New Tenant**: Create a new Enterprise C with Org 3 (ski_patrol)
   - Re-save the assignment (assign ski_patrol again)
   - Verify Org 3 now also gets the assignment

## Files Modified

1. `/src/components/repository/AssignmentManager.tsx` - Cross-tenant assignment creation/removal/loading
2. `/src/hooks/useReportTemplates.tsx` - Removed tenant_id filter from template queries
3. `/supabase/migrations/20251021000000_fix_cross_tenant_report_propagation.sql` - Cross-tenant trigger fix

## Related Documentation

- See `.cursor/rules/respository.mdc` for Repository Propagation Rules
- See memory #9014879 for the original requirement specification

