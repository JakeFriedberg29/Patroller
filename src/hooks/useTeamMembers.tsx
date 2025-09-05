import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('users').select('*');
      
      // RLS policies will handle filtering automatically
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeamMembers((data || []) as TeamMember[]);
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
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
    specialization?: string;
    certifications?: string[];
    radio_call_sign?: string;
  }) => {
    try {
      // Get current user's organization
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!currentUser?.organization_id) {
        throw new Error('No organization found for current user');
      }

      const { error } = await supabase
        .from('users')
        .insert({
          email: memberData.email,
          full_name: memberData.full_name,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          organization_id: currentUser.organization_id,
          tenant_id: currentUser.tenant_id,
          status: 'active',
          profile_data: {
            role: memberData.role,
            specialization: memberData.specialization,
            certifications: memberData.certifications,
            radio_call_sign: memberData.radio_call_sign,
          }
        });

      if (error) throw error;

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