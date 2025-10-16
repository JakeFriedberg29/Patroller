import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { queryKeys } from "@/lib/queryClient";

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
  availablePersonas: string[];
  activePersona?: 'admin' | 'patroller';
}

const fetchUserProfile = async (userId: string | undefined): Promise<UserProfile | null> => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_roles!user_roles_user_id_fkey(role_type, is_active)
    `)
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading user profile:', error);
    throw error;
  }

  if (!data) return null;

  // Get the primary active role
  const activeRoles = data.user_roles?.filter((role: any) => role.is_active) || [];
  const primaryRole = activeRoles[0]?.role_type || 'member';
  
  // Determine available personas based on roles
  const availablePersonas = activeRoles.map((r: any) => r.role_type);
  
  // Safely parse JSON data
  const profileData = typeof data.profile_data === 'object' && data.profile_data !== null 
    ? data.profile_data as any 
    : {};
  
  // Get active persona from preferences
  const preferences = typeof data.preferences === 'object' && data.preferences !== null 
    ? data.preferences as any 
    : {};
  const activePersona = preferences.active_persona as 'admin' | 'patroller' | undefined;
  
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    firstName: data.first_name || data.full_name?.split(' ')[0] || '',
    lastName: data.last_name || data.full_name?.split(' ').slice(1).join(' ') || '',
    phone: data.phone || '',
    role: primaryRole === 'platform_admin' ? 'Platform Admin' : 
          primaryRole === 'enterprise_user' ? 'Enterprise User' : 
          primaryRole === 'organization_user' ? 'Organization User' : 
          primaryRole === 'patroller' ? 'Patroller' : 'User',
    roleType: primaryRole,
    status: data.status,
    profileData: {
      ...profileData,
      tenant_id: data.tenant_id,
      organization_id: data.organization_id,
      user_id: data.id
    },
    availablePersonas,
    activePersona
  };
};

export const useUserProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: loading, error, refetch } = useQuery({
    queryKey: queryKeys.userProfile(user?.id),
    queryFn: () => fetchUserProfile(user?.id),
    enabled: !!user,
  });

  const getRoleDisplayName = (roleType: string): string => {
    switch (roleType) {
      case 'platform_admin': return 'Platform Administrator';
      case 'enterprise_user': return 'Enterprise User';
      case 'organization_user': return 'Organization User';
      case 'patroller': return 'Patroller';
      default: return roleType;
    }
  };

  return { 
    profile: profile || null, 
    loading, 
    error: error ? 'Failed to load profile' : null, 
    refetch 
  };
};
