import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportTemplateSummary } from "@/hooks/useReportTemplates";

export function useTemplateVisibility(organizationId: string | undefined, templates: ReportTemplateSummary[]) {
  const { toast } = useToast();
  const [visibilityByTemplate, setVisibilityByTemplate] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisibility = async () => {
      if (!organizationId || !templates.length) {
        setLoading(false);
        return;
      }

      try {
        // Get tenant ID for the organization
        const { data: orgRow, error: orgErr } = await supabase
          .from('organizations')
          .select('tenant_id')
          .eq('id', organizationId)
          .single();

        if (orgErr) {
          console.error('Error fetching organization:', orgErr);
          setLoading(false);
          return;
        }

        const tenantId = orgRow?.tenant_id as string | undefined;

        // Fetch visibility settings
        const { data } = await supabase
          .from('patroller_report_visibility')
          .select('template_id, visible_to_patrollers')
          .eq('organization_id', organizationId)
          .eq('tenant_id', tenantId || '');

        // Initialize visibility map (default all to true)
        const map: Record<string, boolean> = {};
        templates.forEach(t => { 
          map[t.id] = true; 
        });

        // Override with actual values from DB
        (data || []).forEach(r => { 
          map[r.template_id as string] = !!r.visible_to_patrollers; 
        });

        setVisibilityByTemplate(map);
      } catch (error) {
        console.error('Error fetching visibility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisibility();
  }, [organizationId, templates]);

  const toggleVisibility = async (templateId: string, nextValue: boolean) => {
    if (!organizationId) return;

    try {
      // Get tenant ID
      const { data: orgRow, error: orgErr } = await supabase
        .from('organizations')
        .select('tenant_id')
        .eq('id', organizationId)
        .single();

      if (orgErr) throw orgErr;

      const tenantId = orgRow?.tenant_id as string;

      // Optimistic update
      setVisibilityByTemplate(prev => ({ ...prev, [templateId]: nextValue }));

      // Check if record exists
      const { data: existing } = await supabase
        .from('patroller_report_visibility')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('organization_id', organizationId)
        .eq('template_id', templateId)
        .maybeSingle();

      // Update or insert
      if (existing?.id) {
        const { error } = await supabase
          .from('patroller_report_visibility')
          .update({ visible_to_patrollers: nextValue })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('patroller_report_visibility')
          .insert({ 
            tenant_id: tenantId, 
            organization_id: organizationId, 
            template_id: templateId, 
            visible_to_patrollers: nextValue 
          });

        if (error) throw error;
      }

      // Success toast
      const templateName = templates.find(t => t.id === templateId)?.name || 'Report';
      toast({
        title: "Settings Updated Successfully",
        description: nextValue
          ? `"${templateName}" is now visible to patrollers.`
          : `"${templateName}" is now hidden from patrollers.`,
      });
    } catch (error) {
      // Rollback on error
      setVisibilityByTemplate(prev => ({ ...prev, [templateId]: !nextValue }));
      toast({ 
        title: 'Update failed', 
        description: 'Could not update visibility.', 
        variant: 'destructive' 
      });
      console.error('Error toggling visibility:', error);
    }
  };

  return {
    visibilityByTemplate,
    toggleVisibility,
    loading
  };
}
