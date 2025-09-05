import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface TeamMember {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'deactivated';
  organization_id: string;
  tenant_id: string;
  profile_data?: any;
  created_at: string;
  updated_at: string;
  user_roles: Array<{
    role_type: string;
    is_active: boolean;
  }>;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canManageUsers, isPlatformAdmin } = usePermissions();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(
            role_type,
            is_active
          )
        `);
      
      // Platform admins can see all users, others see only their organization's
      if (!isPlatformAdmin) {
        // Get the current user's organization ID
        const { data: userData } = await supabase
          .from('users')  
          .select('organization_id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
        
        if (userData?.organization_id) {
          query = query.eq('organization_id', userData.organization_id);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (memberData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    radioCallSign?: string;
    specialization?: string;
    certifications?: string[];
    organization_id: string;
  }) => {
    if (!canManageUsers) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add team members",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Get current user's tenant_id for the new member
      const { data: currentUser } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!currentUser?.tenant_id) {
        throw new Error('Unable to determine tenant');
      }

      // Create the user record
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          full_name: `${memberData.firstName} ${memberData.lastName}`,
          first_name: memberData.firstName,
          last_name: memberData.lastName,
          email: memberData.email,
          phone: memberData.phone,
          organization_id: memberData.organization_id,
          tenant_id: currentUser.tenant_id,
          status: 'active',
          profile_data: {
            radio_call_sign: memberData.radioCallSign,
            specialization: memberData.specialization,
            certifications: memberData.certifications
          }
        })
        .select()
        .single();

      if (userError) throw userError;

      // Assign role to the user
      const roleType = memberData.role === 'Team Lead' ? 'supervisor' : 'responder';
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_type: roleType,
          organization_id: memberData.organization_id,
          is_active: true
        });

      if (roleError) throw roleError;

      toast({
        title: "Team Member Added",
        description: `${memberData.firstName} ${memberData.lastName} has been added to the team`,
      });

      // Refresh the team members list
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
    if (!canManageUsers) {
      toast({
        title: "Permission Denied",  
        description: "You don't have permission to edit team members",
        variant: "destructive"
      });
      return false;
    }

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

      // Refresh the team members list
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
    canManageUsers
  };
};