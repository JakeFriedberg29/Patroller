import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: string;
  accountId?: string;
  accountType?: string;
  department?: string;
  location?: string;
  phone?: string;
}

// Map UI roles to database role types
const mapRoleToDbRole = (uiRole: string): string => {
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
      // Create pending user in database
      const { data: result, error: createError } = await supabase
        .rpc('create_pending_user', {
          p_email: userData.email,
          p_full_name: userData.fullName,
          p_tenant_id: userData.accountId || '95d3bca1-40f0-4630-a60e-1d98dacf3e60', // Use demo tenant for now
          p_organization_id: userData.accountType === 'organization' ? userData.accountId : null,
          p_role_type: mapRoleToDbRole(userData.role || 'responder'),
          p_phone: userData.phone || null,
          p_department: userData.department || null,
          p_location: userData.location || null
        });

      if (createError || !result?.success) {
        console.error('Error creating user:', createError);
        toast.error('Failed to create user');
        return { success: false, error: createError?.message || result?.error };
      }

      const userId = result.user_id;

      // Send activation email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          userId,
          email: userData.email,
          fullName: userData.fullName,
          isResend: false
        }
      });

      if (emailError) {
        console.error('Error sending activation email:', emailError);
        toast.error('User created but failed to send activation email');
        return { success: false, error: emailError.message };
      }

      if (emailData?.success) {
        toast.success('User created and activation email sent successfully');
        return { success: true, userId };
      } else {
        toast.error(emailData?.error || 'Failed to send activation email');
        return { success: false, error: emailData?.error };
      }
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

      if (data?.success) {
        toast.success('Account activated successfully');
        return { success: true };
      } else {
        toast.error(data?.error || 'Invalid or expired activation token');
        return { success: false, error: data?.error || 'Invalid activation token' };
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