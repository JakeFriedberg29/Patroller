import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { safeMutation } from "@/lib/safeMutation";

interface UseRepositoryActionsProps {
  tenantId: string | undefined;
  userId: string | null;
  onTemplatesUpdated: () => void;
}

export function useRepositoryActions({ tenantId, userId, onTemplatesUpdated }: UseRepositoryActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (
    templateId: string, 
    nextStatus: 'draft' | 'ready' | 'published' | 'unpublished' | 'archive',
    onSuccess?: (newStatus: string) => void
  ) => {
    try {
      const { data: rpc, error: rpcErr } = await supabase.rpc('report_template_set_status' as any, {
        p_template_id: templateId,
        p_status: nextStatus,
      });
      if (rpcErr) throw rpcErr;
      const rpcObj = (rpc || {}) as any;
      if (rpcObj?.success === false) {
        const err = rpcObj?.error || 'Update failed';
        throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
      }

      const { data: fresh, error: fetchErr } = await supabase
        .from('report_templates')
        .select('status')
        .eq('id', templateId)
        .single();
      if (fetchErr) throw fetchErr;

      toast({ title: 'Status updated', description: `Report status changed to ${fresh?.status}.` });
      if (onSuccess) onSuccess(fresh?.status);
      return fresh?.status;
    } catch (e: any) {
      const errorMsg = e?.message || 'Could not update status.';
      toast({ title: 'Update failed', description: errorMsg, variant: 'destructive' });
      throw e;
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!tenantId) return false;
    setIsDeleting(true);
    try {
      const requestId = crypto.randomUUID();
      await safeMutation(`del-template:${templateId}`, {
        op: async () => {
          const { data, error } = await supabase.rpc('report_template_delete', {
            p_tenant_id: tenantId,
            p_template_id: templateId,
            p_actor_id: userId,
            p_request_id: requestId,
          });
          if (error) throw error;
          return data;
        },
        refetch: async () => {
          await onTemplatesUpdated();
        },
      });
      toast({ title: 'Report deleted', description: `"${templateName}" was permanently removed.` });
      return true;
    } catch (e: any) {
      console.error('Failed to delete template', e);
      let errorMsg = 'Could not delete report. Please try again.';
      
      if (e?.message?.includes('Only archived reports can be deleted') || e?.message?.includes('Cannot delete report template with status')) {
        errorMsg = 'Only archived reports can be deleted. Please archive this report first.';
      } else if (e?.message) {
        errorMsg = e.message;
      }
      
      toast({ title: 'Delete failed', description: errorMsg, variant: 'destructive' });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleStatusChange,
    handleDelete,
    isDeleting,
  };
}
