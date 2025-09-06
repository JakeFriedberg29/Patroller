import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();
  const params = useParams();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      let organizationId = currentUser?.organization_id;

        // If platform admin, get organization from URL params
        if (isPlatformAdmin && !organizationId && params.id) {
          organizationId = params.id;
        }

      if (!organizationId) {
        console.error('No organization context found');
        setTeamMembers([]);
        return;
      }

      let query = supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);
      
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
      // Get current user's info
      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, tenant_id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      let organizationId = currentUser?.organization_id;
      let tenantId = currentUser?.tenant_id;

      // If platform admin, get organization from URL params
      if (isPlatformAdmin && !organizationId && params.id) {
        organizationId = params.id;
        // Get tenant_id for this organization
        const { data: orgData } = await supabase
          .from('organizations')
          .select('tenant_id')
          .eq('id', organizationId)
          .single();
        tenantId = orgData?.tenant_id;
      }

      if (!organizationId || !tenantId) {
        throw new Error('No organization context found');
      }

      const { error } = await supabase
        .from('users')
        .insert({
          email: memberData.email,
          full_name: memberData.full_name,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          organization_id: organizationId,
          tenant_id: tenantId,
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