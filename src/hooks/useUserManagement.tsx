import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEmailService } from "./useEmailService";

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: string;
  permission?: 'full' | 'view';
  tenantId?: string;
  organizationId?: string;
  
  location?: string;
  phone?: string;
}

// Map UI roles to database role types
const mapRoleToDbRole = (uiRole: string): 'platform_admin' | 'enterprise_user' | 'organization_user' | 'supervisor' | 'member' | 'observer' | 'responder' | 'team_leader' => {
  const roleMap: { [key: string]: 'platform_admin' | 'enterprise_user' | 'organization_user' | 'supervisor' | 'member' | 'observer' | 'responder' | 'team_leader' } = {
    'Platform Admin': 'platform_admin',
    'enterprise_user': 'enterprise_user',
    'organization_user': 'organization_user',
    'Admin': 'organization_user',
    'User': 'observer',
    'Team Leader': 'team_leader',
    'Supervisor': 'supervisor',
    'Responder': 'responder',
    'Observer': 'observer'
  };
  return roleMap[uiRole] || 'responder';
};

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTenantId, setCurrentUserTenantId] = useState<string | null>(null);
  const { sendActivationEmail } = useEmailService();

  // Get current user's tenant ID
  useEffect(() => {
    const getCurrentUserTenant = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (userData?.tenant_id) {
            setCurrentUserTenantId(userData.tenant_id);
          }
        }
      } catch (error) {
        console.error('Error getting current user tenant:', error);
      }
    };

    getCurrentUserTenant();
  }, []);

  const createUser = async (userData: CreateUserRequest) => {
    setIsLoading(true);
    
    try {
      // Use passed tenantId or current user's tenant ID
      const tenantId = userData.tenantId || currentUserTenantId;
      
      if (!tenantId) {
        toast.error('Unable to determine tenant. Please refresh and try again.');
        return { success: false, error: 'No tenant ID available' };
      }

      console.log('Creating user with tenant ID:', tenantId);
      
      // Pre-check: email must not exist anywhere (global uniqueness across tenants/orgs)
      const { data: existingUsers, error: existingErr } = await supabase
        .from('users')
        .select('id, tenant_id')
        .ilike('email', userData.email.trim());

      if (existingErr) {
        console.error('Error checking existing users:', existingErr);
      }

      if (existingUsers && existingUsers.length > 0) {
        toast.error('A user with this email already exists in another account.');
        return { success: false, error: 'Email already exists in another account' };
      }
      
      // Create user in the database first (without email confirmation)
      const { data, error } = await supabase.rpc('create_user_with_activation', {
        p_email: userData.email,
        p_full_name: userData.fullName,
        p_tenant_id: tenantId,
        p_organization_id: userData.organizationId || null,
        p_phone: userData.phone || null,
        
        p_location: userData.location || null,
        p_role_type: mapRoleToDbRole(userData.role || 'responder')
      });

      if (error) {
        console.error('Error creating user:', error);
        const normalized = error.message?.toLowerCase() || '';
        if (normalized.includes('uniq_users_email_lower') || normalized.includes('duplicate') || normalized.includes('unique')) {
          toast.error('Email already exists in another account.');
          return { success: false, error: 'Email already exists in another account' };
        }
        toast.error('Failed to create user: ' + error.message);
        return { success: false, error: error.message };
      }

      const result = data as any;
      if (!result?.success || !result?.user_id) {
        // Handle duplicate user error with better message
        if (result?.error?.includes('duplicate key value violates unique constraint')) {
          toast.error('User already invited. Please ask them to check their email or resend the verification email.');
          return { success: false, error: 'User already invited' };
        }
        
        toast.error(result?.error || 'Failed to create user');
        return { success: false, error: result?.error || 'Failed to create user' };
      }

      console.log('User created successfully, sending activation email for userId:', result.user_id);
      
      // Update permission level for enterprise/organization users if specified
      if (userData.permission && (userData.role === 'enterprise_user' || userData.role === 'organization_user')) {
        await supabase
          .from('user_roles')
          .update({ permission: userData.permission })
          .eq('user_id', result.user_id)
          .eq('role_type', userData.role);
      }
      
      // Send activation email using the configured email service
      const emailResult = await sendActivationEmail({
        userId: result.user_id,
        email: userData.email,
        fullName: userData.fullName,
        isResend: false,
        organizationName: 'Emergency Management Platform' // You can make this dynamic
      });

      if (!emailResult.success) {
        console.error('Error sending activation email:', emailResult.error);
        toast.error('User created but failed to send activation email');
        return { success: false, error: 'Failed to send activation email' };
      }

      toast.success(`User created successfully! Activation email sent via ${emailResult.provider}`);
      return { success: true, userId: result.user_id };
    } catch (error: any) {
      console.error('Error in createUser:', error);
      toast.error('Failed to create user');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const activateUser = async (activationToken: string, newPassword?: string) => {
    setIsLoading(true);
    
    try {
      let data;
      let error;
      if (newPassword && newPassword.length > 0) {
        ({ data, error } = await supabase
          .rpc('activate_user_account_with_password', {
            p_activation_token: activationToken,
            p_password: newPassword
          }));
      } else {
        ({ data, error } = await supabase
          .rpc('activate_user_account', {
            p_activation_token: activationToken
          }));
      }

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