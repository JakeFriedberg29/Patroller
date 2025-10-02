import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
  metadata: any;
  new_values: any;
  old_values: any;
  user_name: string | null;
  user_email: string | null;
  ip_address: string | null;
}

interface UseAuditLogsProps {
  searchTerm?: string;
  actionFilter?: string;
  resourceFilter?: string;
  limit?: number;
  accountType?: "platform" | "enterprise" | "organization";
  accountId?: string;
}

export const useAuditLogs = ({ 
  searchTerm = "", 
  actionFilter = "ALL", 
  resourceFilter = "ALL",
  limit = 100,
  accountType,
  accountId
}: UseAuditLogsProps = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAuditLogs();
  }, [searchTerm, actionFilter, resourceFilter, limit]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Normalize filters to ensure consistent comparisons
      const normalizedAction = (actionFilter || "ALL").toUpperCase();
      const normalizedResource = (resourceFilter || "ALL").toLowerCase();

      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          resource_type,
          resource_id,
          created_at,
          metadata,
          new_values,
          old_values,
          ip_address,
          users!audit_logs_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (normalizedAction !== "ALL") {
        // action is stored uppercase in our UI options; ensure DB comparison matches regardless of case
        query = query.ilike('action', normalizedAction);
      }
      
      if (normalizedResource !== "all") {
        // resource_type is typically lowercase; use ilike for safety
        query = query.ilike('resource_type', normalizedResource);
      }

      // Account scoping
      if (accountType === 'platform') {
        const { data: adminUsers, error: adminError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role_type', 'platform_admin');

        if (adminError) throw adminError;

        const adminUserIds = adminUsers.map((u) => u.user_id);
        query = query.in('user_id', adminUserIds);
      } else if (accountType === 'enterprise' && accountId) {
        query = query.eq('tenant_id', accountId);
      } else if (accountType === 'organization' && accountId) {
        const { data: orgUsers, error: usersError } = await supabase
          .from('users')
          .select('id')
          .eq('organization_id', accountId);

        if (usersError) throw usersError;

        const orgUserIds = orgUsers.map(u => u.id);
        
        const orConditions = [
          `user_id.in.(${orgUserIds.join(',')})`,
          `and(resource_type.eq.organization,resource_id.eq.${accountId})`,
          `and(resource_type.eq.user,resource_id.in.(${orgUserIds.join(',')}))`
        ].join(',');

        query = query.or(orConditions);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data and apply search filter
      const transformedLogs: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        action: log.action,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        created_at: log.created_at,
        metadata: log.metadata,
        new_values: log.new_values,
        old_values: log.old_values,
        user_name: log.users?.full_name || null,
        user_email: log.users?.email || null,
        ip_address: typeof log.ip_address === 'string' ? log.ip_address : null,
      }));

      // Apply search filter
      const filteredLogs = searchTerm 
        ? transformedLogs.filter(log => 
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(log.metadata || {}).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : transformedLogs;

      setLogs(filteredLogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadAuditLogs();
  };

  return { logs, loading, error, refetch };
};