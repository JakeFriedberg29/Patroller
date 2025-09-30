import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  roleType: string;
  status: string;
  profileData: any;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(role_type, is_active)
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (queryError) {
        console.error('Error loading user profile:', queryError);
        setError('Failed to load profile');
        return;
      }

      if (data) {
        // Get the primary active role
        const activeRoles = data.user_roles?.filter((role: any) => role.is_active) || [];
        const primaryRole = activeRoles[0]?.role_type || 'member';
        
        // Safely parse JSON data
        const profileData = typeof data.profile_data === 'object' && data.profile_data !== null 
          ? data.profile_data as any 
          : {};
        
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          firstName: data.first_name || data.full_name?.split(' ')[0] || '',
          lastName: data.last_name || data.full_name?.split(' ').slice(1).join(' ') || '',
          phone: data.phone || '',
          role: getRoleDisplayName(primaryRole),
          roleType: primaryRole,
          status: data.status,
          profileData: {
            ...profileData,
            tenant_id: data.tenant_id,
            organization_id: data.organization_id,
            user_id: data.id
          }
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (roleType: string): string => {
    switch (roleType) {
      case 'platform_admin': return 'Platform Administrator';
      case 'enterprise_admin': return 'Enterprise Administrator';
      case 'organization_admin': return 'Organization Administrator';
      case 'supervisor': return 'Supervisor';
      case 'patroller': return 'Patroller';
      case 'member': return 'Member';
      default: return roleType;
    }
  };

  return { profile, loading, error, refetch: loadUserProfile };
};