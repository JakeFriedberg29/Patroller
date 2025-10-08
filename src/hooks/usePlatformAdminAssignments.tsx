import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeMutation } from '@/lib/safeMutation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PlatformAssignment {
  id: string;
  platform_admin_id: string;
  account_id: string;
  account_type: "Enterprise" | "Organization";
  is_active: boolean;
}

export interface AccountAssignment {
  id: string;
  account_id: string;
  account_type: 'Enterprise' | 'Organization';
  account_name: string;
  is_active: boolean;
  assigned_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Enterprise' | 'Organization';
}

// Hook for getting current user's platform admin assignments (for navigation purposes)
export const usePlatformAdminAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PlatformAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // get platform admin's internal user_id
        const { data: me, error: meErr } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (meErr) throw meErr;

        const { data, error } = await supabase
          .from('platform_admin_account_assignments')
          .select('*')
          .eq('platform_admin_id', me.id)
          .eq('is_active', true);
        if (error) throw error;

        const mapped = (data || []).map((row: any) => ({
          id: row.id,
          platform_admin_id: row.platform_admin_id,
          account_id: row.account_id,
          account_type: (row.account_type === 'Enterprise' || row.account_type === 'Organization') ? row.account_type : 'Enterprise',
          is_active: row.is_active,
        })) as PlatformAssignment[];
        setAssignments(mapped);
      } catch (e: any) {
        setError(e.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return { assignments, loading, error };
};

// Hook for managing platform admin assignments (for admin management)
export const usePlatformAdminAssignmentManager = (platformAdminId?: string) => {
  const [assignments, setAssignments] = useState<AccountAssignment[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load assignments for a specific platform admin
  const loadAssignments = async (adminId: string) => {
    if (!adminId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_admin_account_assignments')
        .select(`
          id,
          account_id,
          account_type,
          is_active,
          created_at
        `)
        .eq('platform_admin_id', adminId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assignments:', error);
        toast({
          title: "Error Loading Assignments",
          description: "Failed to load account assignments.",
          variant: "destructive"
        });
        return;
      }

      // Get account details
      const enterpriseIds = data.filter(a => a.account_type === 'Enterprise').map(a => a.account_id);
      const organizationIds = data.filter(a => a.account_type === 'Organization').map(a => a.account_id);

      const [enterpriseData, organizationData] = await Promise.all([
        enterpriseIds.length > 0 ? supabase
          .from('enterprises')
          .select('id, name')
          .in('id', enterpriseIds) : Promise.resolve({ data: [] }),
        organizationIds.length > 0 ? supabase
          .from('organizations')
          .select('id, name')
          .in('id', organizationIds) : Promise.resolve({ data: [] })
      ]);

      const accountNames = new Map<string, string>();
      enterpriseData.data?.forEach(t => accountNames.set(t.id, t.name));
      organizationData.data?.forEach(o => accountNames.set(o.id, o.name));

      const enrichedAssignments: AccountAssignment[] = data.map(assignment => ({
        ...assignment,
        account_type: assignment.account_type as 'Enterprise' | 'Organization',
        account_name: accountNames.get(assignment.account_id) || 'Unknown',
        assigned_at: assignment.created_at
      }));

      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error Loading Assignments",
        description: "Failed to load account assignments.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load available accounts that can be assigned
  const loadAvailableAccounts = async () => {
    try {
      const [tenantData, organizationData] = await Promise.all([
        supabase
          .from('enterprises')
          .select('id, name')
          .eq('subscription_status', 'active')
          .order('name'),
        supabase
          .from('organizations')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
      ]);

      const accounts: Account[] = [
        ...(tenantData.data?.map(t => ({ id: t.id, name: t.name, type: 'Enterprise' as const })) || []),
        ...(organizationData.data?.map(o => ({ id: o.id, name: o.name, type: 'Organization' as const })) || [])
      ];

      setAvailableAccounts(accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  // Add assignment
  const addAssignment = async (adminId: string, accountId: string, accountType: 'Enterprise' | 'Organization') => {
    try {
      const requestId = crypto.randomUUID();
      const ok = await safeMutation(`add-assignment:${adminId}:${accountId}:${accountType}`, {
        op: async () => {
          const { error } = await supabase.rpc('platform_set_admin_assignment', {
            p_admin_id: adminId,
            p_account_id: accountId,
            p_account_type: accountType,
            p_is_active: true,
            p_request_id: requestId,
          });
          if (error) throw error;
        },
        refetch: () => loadAssignments(adminId),
      });
      if (!ok) return false;
      toast({ title: "Assignment Added", description: "Account assignment added successfully." });
      return true;
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({ title: "Error Adding Assignment", description: "Failed to add account assignment.", variant: "destructive" });
      return false;
    }
  };

  // Remove assignment
  const removeAssignment = async (assignmentId: string, adminId: string) => {
    try {
      // Need account_id and account_type to call RPC; fetch minimal fields for this assignment
      const { data: row } = await supabase
        .from('platform_admin_account_assignments')
        .select('account_id, account_type')
        .eq('id', assignmentId)
        .single();
      if (!row) {
        toast({ title: "Error Removing Assignment", description: "Assignment not found.", variant: "destructive" });
        return false;
      }
      const requestId = crypto.randomUUID();
      const ok = await safeMutation(`rm-assignment:${assignmentId}`, {
        op: async () => {
          const { error } = await supabase.rpc('platform_set_admin_assignment', {
            p_admin_id: adminId,
            p_account_id: row.account_id,
            p_account_type: row.account_type,
            p_is_active: false,
            p_request_id: requestId,
          });
          if (error) throw error;
        },
        refetch: () => loadAssignments(adminId),
      });
      if (!ok) return false;
      toast({ title: "Assignment Removed", description: "Account assignment removed successfully." });
      return true;
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({ title: "Error Removing Assignment", description: "Failed to remove account assignment.", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    loadAvailableAccounts();
  }, []);

  useEffect(() => {
    if (platformAdminId) {
      loadAssignments(platformAdminId);
    }
  }, [platformAdminId]);

  return {
    assignments,
    availableAccounts,
    isLoading,
    loadAssignments,
    addAssignment,
    removeAssignment,
    loadAvailableAccounts
  };
};