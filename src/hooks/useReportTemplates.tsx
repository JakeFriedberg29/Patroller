import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

export interface ReportTemplateSummary {
  id: string;
  name: string;
  description: string;
  // Optional future: versioning
  // version?: number;
}

/**
 * Returns the report templates available to a specific organization.
 *
 * Today: falls back to the app's DEFAULT_REPORT_TEMPLATES.
 * Future-ready: if tables exist, will read assignments from
 * - organization_report_templates (tenant scoped)
 * - report_templates
 * while enforcing tenant and organization scoping.
 */
export const useOrganizationReportTemplates = (organizationId?: string, tenantId?: string) => {
  const { profile } = useUserProfile();
  const [templates, setTemplates] = useState<ReportTemplateSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const orgId = organizationId || profile?.profileData?.organization_id;
  const viewerTenantId = tenantId || profile?.profileData?.tenant_id;

  // No fallback to static/dummy templates. Only show repository-created assignments.

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        // If we have org/tenant context, attempt to fetch templates assigned by org and by org_type
        if (orgId) {
          // Determine this organization's type
          const { data: org, error: orgErr } = await supabase
            .from('organizations')
            .select('organization_type, organization_subtype, tenant_id')
            .eq('id', orgId)
            .single();
          if (orgErr) throw orgErr;
          const orgType = org?.organization_type as string | undefined;
          const orgSubtype = (org?.organization_subtype as string | undefined) || undefined;
          const resolvedTenantId = org?.tenant_id as string | undefined || viewerTenantId;

          // Assignments via repository_assignments (type or org-level)
          let assignedTemplateIds: string[] = [];
          if (resolvedTenantId) {
            console.log('[useOrganizationReportTemplates] Looking up templates for:', {
              orgId,
              orgType,
              orgSubtype,
              resolvedTenantId
            });

            // Subtype-based (FK)
            if (orgSubtype) {
              // Resolve subtype name for this org to id
              const { data: subtypeRow, error: subtypeErr } = await supabase
                .from('organization_subtypes')
                .select('id')
                .eq('tenant_id', resolvedTenantId)
                .eq('name', orgSubtype)
                .single();
              
              console.log('[useOrganizationReportTemplates] Subtype lookup:', {
                orgSubtype,
                tenantId: resolvedTenantId,
                subtypeRow,
                error: subtypeErr
              });

              const subtypeId = subtypeRow?.id as string | undefined;
              if (subtypeId) {
                const { data: typeAssignments, error: assignErr } = await supabase
                  .from('repository_assignments')
                  .select('element_id')
                  .eq('tenant_id', resolvedTenantId)
                  .eq('element_type', 'report_template')
                  .eq('target_type', 'organization_type')
                  .eq('target_organization_subtype_id', subtypeId);
                
                console.log('[useOrganizationReportTemplates] Assignment lookup:', {
                  subtypeId,
                  assignments: typeAssignments,
                  error: assignErr
                });

                assignedTemplateIds.push(...((typeAssignments || []).map((r: any) => r.element_id)));
              } else {
                console.warn('[useOrganizationReportTemplates] No subtype ID found - subtype may not exist in organization_subtypes table for this tenant');
              }
            }
            // Org-level
            const { data: orgAssignments } = await supabase
              .from('repository_assignments')
              .select('element_id')
              .eq('tenant_id', resolvedTenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization')
              .eq('target_organization_id', orgId);
            assignedTemplateIds.push(...((orgAssignments || []).map((r: any) => r.element_id)));
          }

          const allIds = [...new Set(assignedTemplateIds)];
          console.log('[useOrganizationReportTemplates] Found template IDs:', allIds);

          if (allIds.length > 0) {
            // Query templates by ID only - don't filter by tenant_id because
            // platform templates belong to the platform tenant but are available to all orgs
            const { data: templatesData, error: templateErr } = await supabase
              .from('report_templates')
              .select('id, name, description, tenant_id, status')
              .in('id', allIds)
              .eq('status', 'published')
              .is('organization_id', null); // Only platform-level templates
            
            console.log('[useOrganizationReportTemplates] Template query result:', {
              foundTemplates: templatesData?.length || 0,
              templates: templatesData,
              error: templateErr
            });

            if (templatesData && templatesData.length > 0) {
              setTemplates(templatesData.map(t => ({ id: t.id as any, name: t.name as any, description: (t.description as any) || '' })));
              setLoading(false);
              return;
            }
          } else {
            console.warn('[useOrganizationReportTemplates] No assigned template IDs found for this organization');
          }
        }
      } catch (err: any) {
        // Swallow errors and fall back to default
        console.error('[useOrganizationReportTemplates] Error fetching templates:', err);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, viewerTenantId]);

  return { templates, loading, error };
};


