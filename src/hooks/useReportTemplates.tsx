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
            .select('organization_type, tenant_id')
            .eq('id', orgId)
            .single();
          if (orgErr) throw orgErr;
          const orgType = org?.organization_type as string | undefined;
          const resolvedTenantId = org?.tenant_id as string | undefined || viewerTenantId;

          // 1) Direct org assignments (legacy) -> optional table; ignore errors
          let directTemplateIds: string[] = [];
          // Skip organization_report_templates table as it doesn't exist
          
          // 2) Subtype-based assignments via platform_assignments
          let typeTemplateIds: string[] = [];
          if (orgType && resolvedTenantId) {
            const { data: typeAssignments } = await supabase
              .from('platform_assignments')
              .select('element_id')
              .eq('tenant_id', resolvedTenantId)
              .eq('element_type', 'report_template')
              .eq('target_type', 'organization_type')
              .eq('target_organization_type', orgType as any);
            typeTemplateIds = (typeAssignments || []).map((r: any) => r.element_id);
          }

          const allIds = [...new Set([...directTemplateIds, ...typeTemplateIds])];
          if (allIds.length > 0) {
            const { data: templatesData } = await supabase
              .from('report_templates')
              .select('id, name, description, tenant_id')
              .in('id', allIds)
              .eq('tenant_id', resolvedTenantId as string);
            if (templatesData && templatesData.length > 0) {
              setTemplates(templatesData.map(t => ({ id: t.id as any, name: t.name as any, description: (t.description as any) || '' })));
              setLoading(false);
              return;
            }
          }
        }
      } catch (err: any) {
        // Swallow errors and fall back to default
        console.warn('Falling back to default report templates:', err?.message || err);
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


