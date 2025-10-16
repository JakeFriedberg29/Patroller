import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserManagement } from "@/hooks/useUserManagement";

export interface UserFormData {
  fullName: string;
  email: string;
  phone?: string;
  accessRole?: "read" | "write";
  roleTypes?: {
    admin: boolean;
    patroller: boolean;
  };
}

export interface UserModalHookProps {
  accountType: "platform" | "enterprise" | "organization";
  accountId?: string;
  mode: "add" | "edit";
  userId?: string;
}

export function useUserModal({ accountType, accountId, mode, userId }: UserModalHookProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [autoAssignAll, setAutoAssignAll] = useState<boolean | null>(null);
  const { createUser } = useUserManagement();

  // Resolve tenant ID for organizations
  const resolveTenantId = async (orgId: string): Promise<string> => {
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .select('tenant_id')
      .eq('id', orgId)
      .single();
    
    if (orgErr) {
      console.error('Failed to load organization tenant_id:', orgErr);
      throw orgErr;
    }
    
    // For standalone organizations (tenant_id is null), use the organization ID as tenant
    // For organizations under an enterprise, use the enterprise's tenant_id
    return org?.tenant_id || orgId;
  };

  const handleAdd = async (values: UserFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      let tenantIdToUse = accountId;
      
      if (accountType === "organization" && accountId) {
        tenantIdToUse = await resolveTenantId(accountId);
      }
      
      // Determine role based on account type
      const role = accountType === "platform" 
        ? "Platform Admin" 
        : accountType === "enterprise" 
        ? "Enterprise User" 
        : "Organization User";
      
      // For organization users, determine role types
      const roleTypes: string[] = [];
      if (accountType === "organization" && values.roleTypes) {
        if (values.roleTypes.admin) roleTypes.push("organization_user");
        if (values.roleTypes.patroller) roleTypes.push("patroller");
      }
      
      const result = await createUser({
        email: values.email,
        fullName: values.fullName,
        role,
        accessRole: values.accessRole || 'read',
        tenantId: tenantIdToUse,
        organizationId: accountType === "organization" ? accountId : undefined,
        roleTypes: roleTypes.length > 0 ? roleTypes : undefined
      });
      
      return result.success;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (values: UserFormData): Promise<boolean> => {
    if (!userId) return false;
    
    setIsLoading(true);
    try {
      // Update user basic info
      const { error } = await supabase
        .from('users')
        .update({
          full_name: values.fullName,
          first_name: values.fullName.split(' ')[0],
          last_name: values.fullName.split(' ').slice(1).join(' '),
          email: values.email,
          phone: values.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
        return false;
      }

      // Update auto-assign preference if it changed for platform admins
      if (accountType === "platform" && autoAssignAll !== null) {
        const { data: currentData } = await supabase
          .from('users')
          .select('profile_data')
          .eq('id', userId)
          .single();

        const updatedProfileData = {
          ...(currentData?.profile_data as any || {}),
          auto_assign_all_accounts: autoAssignAll
        };

        await supabase
          .from('users')
          .update({ profile_data: updatedProfileData })
          .eq('id', userId);
      }

      // Update access role for platform admins
      if (accountType === "platform" && values.accessRole) {
        const { data: userData } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', userId)
          .single();

        if (userData?.tenant_id) {
          await supabase
            .from('account_users')
            .upsert({
              user_id: userId,
              tenant_id: userData.tenant_id,
              organization_id: null,
              access_role: values.accessRole,
              is_active: true
            }, { 
              onConflict: 'tenant_id,organization_id,user_id' 
            });
        }
      }

      toast.success('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async (
    currentStatus: "pending" | "active" | "disabled" | "deleted"
  ): Promise<boolean> => {
    if (!userId) return false;
    
    setIsSuspending(true);
    try {
      const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
      
      const { error } = await supabase
        .from('users')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast.error(`Failed to ${newStatus === 'disabled' ? 'disable' : 'enable'} user`);
        return false;
      }

      toast.success(`User ${newStatus === 'disabled' ? 'disabled' : 'enabled'} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(`Failed to ${currentStatus === 'disabled' ? 'enable' : 'disable'} user`);
      return false;
    } finally {
      setIsSuspending(false);
    }
  };

  return {
    isLoading,
    isSuspending,
    autoAssignAll,
    setAutoAssignAll,
    handleAdd,
    handleEdit,
    handleSuspendToggle
  };
}
