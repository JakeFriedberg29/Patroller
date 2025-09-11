import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlatformAssignment {
  id: string;
  platform_admin_id: string;
  account_id: string; // tenant id or organization id depending on account_type
  account_type: "Enterprise" | "Organization";
  is_active: boolean;
}

export const usePlatformAdminAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<PlatformAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
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

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccountAssignment {
  id: string;
  account_id: string;
  account_type: 'enterprise' | 'organization';
  account_name: string;
  is_active: boolean;
  assigned_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'enterprise' | 'organization';
}

export const usePlatformAdminAssignments = (platformAdminId?: string) => {
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
          assigned_at
        `)
        .eq('platform_admin_id', adminId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

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
      const enterpriseIds = data.filter(a => a.account_type === 'enterprise').map(a => a.account_id);
      const organizationIds = data.filter(a => a.account_type === 'organization').map(a => a.account_id);

      const [enterpriseData, organizationData] = await Promise.all([
        enterpriseIds.length > 0 ? supabase
          .from('tenants')
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
        account_type: assignment.account_type as 'enterprise' | 'organization',
        account_name: accountNames.get(assignment.account_id) || 'Unknown'
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
          .from('tenants')
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
        ...(tenantData.data?.map(t => ({ id: t.id, name: t.name, type: 'enterprise' as const })) || []),
        ...(organizationData.data?.map(o => ({ id: o.id, name: o.name, type: 'organization' as const })) || [])
      ];

      setAvailableAccounts(accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  // Add assignment
  const addAssignment = async (adminId: string, accountId: string, accountType: 'enterprise' | 'organization') => {
    try {
      const { error } = await supabase
        .from('platform_admin_account_assignments')
        .insert({
          platform_admin_id: adminId,
          account_id: accountId,
          account_type: accountType,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Assignment Already Exists",
            description: "This account is already assigned to the administrator.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error Adding Assignment",
            description: "Failed to add account assignment.",
            variant: "destructive"
          });
        }
        return false;
      }

      toast({
        title: "Assignment Added",
        description: "Account assignment added successfully."
      });
      
      await loadAssignments(adminId);
      return true;
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({
        title: "Error Adding Assignment",
        description: "Failed to add account assignment.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remove assignment
  const removeAssignment = async (assignmentId: string, adminId: string) => {
    try {
      const { error } = await supabase
        .from('platform_admin_account_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) {
        toast({
          title: "Error Removing Assignment",
          description: "Failed to remove account assignment.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Assignment Removed",
        description: "Account assignment removed successfully."
      });
      
      await loadAssignments(adminId);
      return true;
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error Removing Assignment",
        description: "Failed to remove account assignment.",
        variant: "destructive"
      });
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