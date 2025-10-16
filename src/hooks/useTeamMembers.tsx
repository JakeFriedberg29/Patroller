import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/hooks/useUserManagement';
import { usePermissions } from '@/hooks/usePermissions';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'deactivated';
  organization_id: string;
  profile_data?: any;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();
  const params = useParams();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { createUser } = useUserManagement();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      let organizationId = currentUser?.organization_id;

      // For platform admins, ALWAYS use URL organization ID if available and valid
      if (isPlatformAdmin) {
        const urlOrgId = params.id;
        console.log('Platform admin URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          organizationId = urlOrgId;
        } else if (!organizationId) {
          console.error("Platform admin: Invalid or missing organization ID in URL:", urlOrgId);
          setTeamMembers([]);
          return;
        }
      }

      console.log('Final organization context:', {
        isPlatformAdmin,
        currentUserOrgId: currentUser?.organization_id,
        urlOrgId: params.id,
        finalOrgId: organizationId
      });

      if (!isValidUuid(organizationId)) {
        console.error('No valid organization context found. currentUser:', currentUser, 'params.id:', params.id, 'isPlatformAdmin:', isPlatformAdmin);
        setTeamMembers([]);
        return;
      }

      // Join through account_users to ensure only org-scoped users appear
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeamMembers((data || []) as TeamMember[]);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load team members",
        variant: "destructive"
      });
      setTeamMembers([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (memberData: {
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
    certifications?: string[];
    radio_call_sign?: string;
  }) => {
    try {
      // Get current user's info
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Helper function to validate UUID
      const isValidUuid = (id: string | undefined): boolean => {
        return !!(id && id !== 'undefined' && id !== 'null' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      };

      let organizationId = currentUser?.organization_id;
      let tenantId = currentUser?.tenant_id;

      // For platform admins, ALWAYS use URL organization ID if available and valid
      if (isPlatformAdmin) {
        const urlOrgId = params.id;
        console.log('Platform admin creating member - URL org ID:', urlOrgId, 'isValid:', isValidUuid(urlOrgId));
        
        if (isValidUuid(urlOrgId)) {
          organizationId = urlOrgId;
          // Get tenant_id for this organization
          const { data: orgData } = await supabase
            .from('organizations')
            .select('tenant_id')
            .eq('id', organizationId)
            .single();
          // For standalone organizations (tenant_id is null), use the organization ID as tenant
          tenantId = orgData?.tenant_id || organizationId;
        } else {
          console.error("Platform admin: Invalid organization ID in URL:", urlOrgId);
          throw new Error("Invalid organization ID in URL");
        }
      }

      console.log('Create member context:', {
        isPlatformAdmin,
        currentUserOrgId: currentUser?.organization_id,
        urlOrgId: params.id,
        finalOrgId: organizationId,
        tenantId
      });

      if (!isValidUuid(organizationId) || !tenantId) {
        console.error('No valid organization context found. currentUser:', currentUser, 'params.id:', params.id, 'isPlatformAdmin:', isPlatformAdmin);
        throw new Error('No organization context found');
      }

      const roleTitle = memberData.role === 'Admin' ? 'User' : memberData.role === 'User' ? 'User' : 'Patroller';
      const accessRole: 'read' | 'write' = memberData.role === 'Admin' ? 'write' : memberData.role === 'User' ? 'read' : 'read';
      const result = await createUser({
        email: memberData.email,
        fullName: memberData.full_name,
        role: roleTitle,
        accessRole,
        tenantId,
        organizationId,
        phone: memberData.phone
      });

      if (!result.success) throw new Error(result.error || 'Failed to create member');

      toast({
        title: "Team Member Added",
        description: `${memberData.full_name} has been added successfully`,
      });

      fetchTeamMembers();
      return true;
    } catch (error) {
      console.error('Error creating team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Team Member Updated",
        description: "Team member has been updated successfully",
      });

      fetchTeamMembers();
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
  };
};