import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: string;
  tenantId?: string;
  organizationId?: string;
  department?: string;
  location?: string;
  phone?: string;
}

// Map UI roles to database role types
const mapRoleToDbRole = (uiRole: string) => {
  const roleMap: { [key: string]: string } = {
    'Platform Admin': 'platform_admin',
    'Enterprise Admin': 'enterprise_admin', 
    'Team Leader': 'team_leader',
    'Responder': 'responder',
    'Observer': 'observer'
  };
  return roleMap[uiRole] || 'responder';
};

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserRequest) => {
    setIsLoading(true);
    
    try {
      // Generate a temporary password for the user
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: userData.fullName,
            tenant_id: userData.tenantId || '95d3bca1-40f0-4630-a60e-1d98dacf3e60',
            organization_id: userData.organizationId,
            phone: userData.phone,
            department: userData.department,
            location: userData.location,
            role_type: mapRoleToDbRole(userData.role || 'responder')
          }
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        toast.error('Failed to create user: ' + authError.message);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        toast.error('Failed to create user');
        return { success: false, error: 'Failed to create user' };
      }

      toast.success(`User created successfully! They will receive a confirmation email at ${userData.email}`);
      return { success: true, userId: authData.user.id };
    } catch (error: any) {
      console.error('Error in createUser:', error);
      toast.error('Failed to create user');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const activateUser = async (activationToken: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('activate_user_account', {
          p_activation_token: activationToken
        });

      if (error) {
        console.error('Error activating user:', error);
        toast.error('Failed to activate user account');
        return { success: false, error: error.message };
      }

      if ((data as any)?.success) {
        toast.success('Account activated successfully');
        return { success: true };
      } else {
        toast.error((data as any)?.error || 'Invalid or expired activation token');
        return { success: false, error: (data as any)?.error || 'Invalid activation token' };
      }
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user account');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    activateUser,
    isLoading
  };
};