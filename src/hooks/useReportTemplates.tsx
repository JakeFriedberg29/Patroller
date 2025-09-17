import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { reportTemplates as DEFAULT_REPORT_TEMPLATES } from "@/pages/CreateReport";

export interface ReportTemplateSummary {
  id: number;
  name: string;
  description: string;
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
  const tId = tenantId || profile?.profileData?.tenant_id;

  const defaultTemplates: ReportTemplateSummary[] = useMemo(() => {
    return (DEFAULT_REPORT_TEMPLATES || []).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        // If we have org/tenant context, attempt to fetch assignments.
        if (orgId && tId) {
          // Try to read assigned template IDs for this organization and tenant.
          const { data: assignments, error: assignmentError } = await supabase
            .from('organization_report_templates')
            .select('template_id')
            .eq('organization_id', orgId)
            .eq('tenant_id', tId);

          // If table doesn't exist or any error, fall back silently
          if (!assignmentError && assignments && assignments.length > 0) {
            const templateIds = assignments.map(a => a.template_id);
            const { data: assignedTemplates, error: tmplError } = await supabase
              .from('report_templates')
              .select('id, name, description, tenant_id')
              .in('id', templateIds)
              .eq('tenant_id', tId);

            if (!tmplError && assignedTemplates && assignedTemplates.length > 0) {
              setTemplates(assignedTemplates.map(t => ({ id: t.id, name: t.name, description: t.description })));
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
        // Always provide a sensible default
        setTemplates(defaultTemplates);
        setLoading(false);
      }
    };

    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, tId]);

  return { templates, loading, error };
};


