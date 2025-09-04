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
      // Create user in the database first (without email confirmation)
      const { data, error } = await supabase.rpc('create_user_with_activation', {
        p_email: userData.email,
        p_full_name: userData.fullName,
        p_tenant_id: userData.tenantId || '95d3bca1-40f0-4630-a60e-1d98dacf3e60',
        p_organization_id: userData.organizationId || null,
        p_phone: userData.phone || null,
        p_department: userData.department || null,
        p_location: userData.location || null,
        p_role_type: mapRoleToDbRole(userData.role || 'responder')
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user: ' + error.message);
        return { success: false, error: error.message };
      }

      if (!data?.user_id) {
        toast.error('Failed to create user');
        return { success: false, error: 'Failed to create user' };
      }

      // Send activation email with temporary password
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          userId: data.user_id,
          email: userData.email,
          fullName: userData.fullName,
          isResend: false
        }
      });

      if (emailError) {
        console.error('Error sending activation email:', emailError);
        toast.error('User created but failed to send activation email');
        return { success: false, error: 'Failed to send activation email' };
      }

      if (!emailData?.success) {
        toast.error(emailData?.error || 'Failed to send activation email');
        return { success: false, error: emailData?.error || 'Failed to send activation email' };
      }

      toast.success(`User created successfully! Activation email sent to ${userData.email}`);
      return { success: true, userId: data.user_id };
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
        return { 
          success: true, 
          credentials: (data as any)?.credentials || null
        };
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