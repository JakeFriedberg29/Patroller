import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SendEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  isResend?: boolean;
  organizationName?: string;
}

type EmailProvider = 'supabase' | 'resend';

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Prefer env-based selection; default to 'resend' for best compatibility with custom activation flow
  const EMAIL_PROVIDER: EmailProvider = (import.meta as any)?.env?.VITE_EMAIL_PROVIDER as EmailProvider || 'resend';

  const invokeCreateInvitation = async (request: SendEmailRequest) => {
    const { data, error } = await supabase.functions.invoke('invitations', {
      body: request
    });
    return { data, error };
  };

  const sendActivationEmail = async (request: SendEmailRequest) => {
    setIsLoading(true);
    
    try {
      const { data: response, error } = await invokeCreateInvitation(request);

      if (error) {
        console.error(`Error sending email via ${EMAIL_PROVIDER}:`, error);
        
        // Handle specific Resend domain verification error
        if (error.message?.includes('Domain verification required')) {
          toast.error(
            'Email domain not verified. Please verify your domain at resend.com/domains or contact your administrator.',
            { duration: 6000 }
          );
          return { success: false, error: 'Domain verification required' };
        }

        // Handle Supabase Auth limitations
        if (error.message?.includes('can only send testing emails')) {
          toast.error(
            'Email service is in testing mode. Please contact your administrator to set up a verified domain.',
            { duration: 6000 }
          );
          return { success: false, error: 'Email service in testing mode' };
        }

        toast.error(`Failed to send ${request.isResend ? 'resend' : 'send'} activation email`);
        return { success: false, error: error.message };
      }

      if (!response?.success) {
        const errorMessage = response?.error || 'Failed to send activation email';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      const action = request.isResend ? 'resent' : 'sent';
      toast.success(`Activation email ${action} successfully!`);
      
      return { 
        success: true, 
        message: response.message,
        provider: EMAIL_PROVIDER === 'supabase' && response?.emailId ? 'resend' : EMAIL_PROVIDER,
        emailId: response.emailId,
        activationUrl: response.activationUrl // Only returned in development
      };

    } catch (error: any) {
      console.error(`Error in ${EMAIL_PROVIDER} email service:`, error);
      toast.error('Failed to send activation email');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderStatus = () => {
    return {
      provider: EMAIL_PROVIDER,
      isResend: EMAIL_PROVIDER === 'resend',
      isSupabase: EMAIL_PROVIDER === 'supabase',
      needsDomainVerification: EMAIL_PROVIDER === 'resend'
    };
  };

  return {
    sendActivationEmail,
    getProviderStatus,
    isLoading,
    EMAIL_PROVIDER
  };
};
