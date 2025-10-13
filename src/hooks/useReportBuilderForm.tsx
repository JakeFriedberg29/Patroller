import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { FieldRow, FieldType } from "@/components/report-builder/FieldEditor";

export function useReportBuilderForm(templateId?: string) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'ready' | 'published' | 'unpublished' | 'archive'>("draft");

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);
  const [availableSubtypes, setAvailableSubtypes] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [assignToAllOrgs, setAssignToAllOrgs] = useState<boolean>(false);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      
      // Load available organization subtypes
      const tenantId = profile?.profileData?.tenant_id;
      if (tenantId) {
        const { data: subtypes } = await supabase
          .from('organization_subtypes')
          .select('name')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        setAvailableSubtypes((subtypes || []).map((s: any) => s.name));
      }
      
      if (!templateId || templateId === 'new') {
        // Create mode
        setName("");
        setDescription("");
        setFieldRows([]);
        setSelectedSubtypes([]);
        setAssignToAllOrgs(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('report_templates')
        .select('id,name,description,template_schema,status')
        .eq('id', templateId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast({ title: 'Not found', description: 'Template not found', variant: 'destructive' });
        navigate('/repository');
        return;
      }

      setName(data.name || "");
      setDescription((data.description as string) || "");
      setStatus((data as any).status || 'draft');
      const schema = (data as any).template_schema as any;
      const rows: FieldRow[] = Array.isArray(schema?.fields)
        ? schema.fields.map((f: any) => ({ 
            id: crypto.randomUUID(), 
            name: String(f.name || ''), 
            type: (f.type === 'single_select' || f.type === 'multi_select') ? 'dropdown' : (f.type || 'short_answer') as FieldType,
            required: Boolean(f.required || false),
            options: f.options || [],
            multiSelect: f.type === 'multi_select' || f.multiSelect,
            label: f.label || '',
            width: f.width || 'full'
          }))
        : [];
      setFieldRows(rows);
      
      // Load existing assignments
      if (tenantId) {
        const { data: assignments } = await supabase
          .from('repository_assignments')
          .select('target_organization_subtype_id, target_organization_id')
          .eq('tenant_id', tenantId)
          .eq('element_type', 'report_template')
          .eq('element_id', templateId);
        
        const hasOrgAssignments = (assignments || []).some((a: any) => a.target_organization_id);
        const hasSubtypeAssignments = (assignments || []).some((a: any) => a.target_organization_subtype_id);
        
        if (hasOrgAssignments && !hasSubtypeAssignments) {
          const { data: allOrgs } = await supabase
            .from('organizations')
            .select('id')
            .eq('tenant_id', tenantId);
          
          const assignedOrgIds = (assignments || [])
            .map((a: any) => a.target_organization_id)
            .filter(Boolean);
          
          if (allOrgs && assignedOrgIds.length === allOrgs.length) {
            setAssignToAllOrgs(true);
          }
        } else {
          const subtypeIds = (assignments || [])
            .map((a: any) => a.target_organization_subtype_id)
            .filter(Boolean);
          
          if (subtypeIds.length > 0) {
            const { data: subtypeNames } = await supabase
              .from('organization_subtypes')
              .select('name')
              .eq('tenant_id', tenantId)
              .in('id', subtypeIds as any);
            setSelectedSubtypes((subtypeNames || []).map((s: any) => s.name));
          }
        }
      }
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load template', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addFieldRow = (type: FieldType = 'short_answer', insertAfterIndex?: number) => {
    const newField: FieldRow = { 
      id: crypto.randomUUID(), 
      name: type === 'divider' ? '' : type === 'page_break' ? '' : '', 
      type, 
      required: false, 
      options: [],
      multiSelect: false,
      label: '',
      width: 'full'
    };
    
    if (insertAfterIndex !== undefined) {
      setFieldRows(prev => {
        const newRows = [...prev];
        newRows.splice(insertAfterIndex + 1, 0, newField);
        return newRows;
      });
    } else {
      setFieldRows(prev => [...prev, newField]);
    }
  };

  const updateFieldRow = (id: string, patch: Partial<FieldRow>) => {
    setFieldRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const removeFieldRow = (id: string) => {
    setFieldRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please provide a report name.', variant: 'destructive' });
      return false;
    }
    
    if (!profile?.profileData?.user_id && (!templateId || templateId === 'new')) {
      toast({ title: 'Please wait', description: 'Loading user profile...', variant: 'destructive' });
      return false;
    }

    const schema = { fields: fieldRows.map(r => ({ 
      name: r.name.trim(), 
      type: r.type === 'dropdown' ? (r.multiSelect ? 'multi_select' : 'single_select') : r.type, 
      required: r.required,
      options: r.options?.filter(opt => opt.trim()) || [],
      multiSelect: r.multiSelect,
      label: r.label || '',
      width: r.width || 'full'
    })) };

    setSaving(true);
    try {
      if (!templateId || templateId === 'new') {
        // Insert new template
        const tenantId = profile?.profileData?.tenant_id;
        const createdBy = profile?.profileData?.user_id || null;
        
        if (!tenantId) {
          throw new Error('Unable to determine tenant ID. Please refresh and try again.');
        }
        
        const { data, error } = await supabase
          .from('report_templates')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            template_schema: schema as any,
            is_active: true,
            status: status,
            tenant_id: tenantId,
            organization_id: null,
            created_by: createdBy,
          })
          .select();
        
        if (error) throw error;
        
        // Save organization assignments
        if (data && data[0]?.id) {
          await saveAssignments(data[0].id, tenantId);
        }
      } else {
        // Update existing template
        const { error } = await supabase
          .from('report_templates')
          .update({ 
            name: name.trim(), 
            description: description.trim() || null, 
            template_schema: schema as any, 
            status: status 
          })
          .eq('id', templateId);
        if (error) throw error;
        
        // Update assignments
        const tenantId = profile?.profileData?.tenant_id;
        if (tenantId) {
          await supabase
            .from('repository_assignments')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('element_type', 'report_template')
            .eq('element_id', templateId);
          
          await saveAssignments(templateId, tenantId);
        }
      }

      toast({ title: 'Report saved', description: 'Changes saved successfully.' });
      navigate('/repository');
      return true;
    } catch (e: any) {
      let errorMsg = 'Could not save the report. Please try again.';
      
      if (e?.message?.includes('duplicate key') || e?.code === '23505') {
        errorMsg = `A report with the name "${name.trim()}" already exists. Please choose a different name.`;
      } else if (e?.message) {
        errorMsg = e.message;
      }
      
      toast({ title: 'Save failed', description: errorMsg, variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAssignments = async (tId: string, tenantId: string) => {
    if (assignToAllOrgs) {
      const { data: allOrgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('tenant_id', tenantId);
      
      if (allOrgs && allOrgs.length > 0) {
        const assignments = allOrgs.map((org: any) => ({
          tenant_id: tenantId,
          element_type: 'report_template' as const,
          element_id: tId,
          target_type: 'organization' as const,
          target_organization_id: org.id,
        }));
        
        await supabase
          .from('repository_assignments')
          .insert(assignments);
      }
    } else if (selectedSubtypes.length > 0) {
      const { data: subtypeData } = await supabase
        .from('organization_subtypes')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .in('name', selectedSubtypes as any);
      
      const assignments = (subtypeData || []).map((subtype: any) => ({
        tenant_id: tenantId,
        element_type: 'report_template' as const,
        element_id: tId,
        target_type: 'organization_type' as const,
        target_organization_subtype_id: subtype.id,
      }));
      
      if (assignments.length > 0) {
        await supabase
          .from('repository_assignments')
          .insert(assignments);
      }
    }
  };

  const handleStatusChange = async (next: 'draft' | 'ready' | 'published' | 'unpublished' | 'archive') => {
    try {
      setStatus(next);
      if (templateId && templateId !== 'new') {
        const { error } = await supabase
          .from('report_templates')
          .update({ status: next })
          .eq('id', templateId);
        
        if (error) throw error;
        
        toast({ title: 'Status updated', description: `Report set to ${next}.` });
      }
    } catch (e: any) {
      let errorMsg = 'Could not update status.';
      
      if (e?.message?.includes('Invalid status transition')) {
        errorMsg = `Invalid status change. ${e.message}`;
      } else if (e?.message) {
        errorMsg = `Update failed: ${e.message}`;
      }
      
      toast({ title: 'Update failed', description: errorMsg, variant: 'destructive' });
    }
  };

  return {
    loading,
    saving,
    status,
    name,
    description,
    fieldRows,
    availableSubtypes,
    selectedSubtypes,
    assignToAllOrgs,
    setName,
    setDescription,
    setFieldRows,
    setSelectedSubtypes,
    setAssignToAllOrgs,
    addFieldRow,
    updateFieldRow,
    removeFieldRow,
    loadTemplate,
    handleSave,
    handleStatusChange,
  };
}
