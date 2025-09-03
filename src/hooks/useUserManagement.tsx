import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: string;
  accountId?: string;
  accountType?: string;
}

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserRequest) => {
    setIsLoading(true);
    
    try {
      // Create pending user in database
      const { data: userId, error: createError } = await supabase
        .rpc('create_pending_user', {
          user_email: userData.email,
          user_full_name: userData.fullName,
          user_role: userData.role || 'user',
          user_account_id: userData.accountId || null,
          user_account_type: userData.accountType || null
        });

      if (createError) {
        console.error('Error creating user:', createError);
        toast.error('Failed to create user');
        return { success: false, error: createError.message };
      }

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
          activation_token_param: activationToken
        });

      if (error) {
        console.error('Error activating user:', error);
        toast.error('Failed to activate user account');
        return { success: false, error: error.message };
      }

      if (data) {
        toast.success('Account activated successfully');
        return { success: true };
      } else {
        toast.error('Invalid or expired activation token');
        return { success: false, error: 'Invalid activation token' };
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