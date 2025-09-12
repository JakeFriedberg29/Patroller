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

  const invokeSupabaseInvite = async (request: SendEmailRequest) => {
    console.log('Sending email via Supabase Auth...');
    const { data, error } = await supabase.functions.invoke('send-activation-email', {
      body: request
    });
    return { data, error };
  };

  const invokeResendEmail = async (request: SendEmailRequest) => {
    console.log('Sending email via Resend...');
    const { data, error } = await supabase.functions.invoke('send-resend-email', {
      body: request
    });
    return { data, error };
  };

  const sendActivationEmail = async (request: SendEmailRequest) => {
    setIsLoading(true);
    let usedProvider: EmailProvider = EMAIL_PROVIDER;

    try {
      let primary;
      let fallback;

      if (EMAIL_PROVIDER === 'resend') {
        primary = invokeResendEmail;
        fallback = invokeSupabaseInvite;
      } else {
        primary = invokeSupabaseInvite;
        fallback = invokeResendEmail;
      }

      // Try primary provider
      let { data: response, error } = await primary(request);

      // Decide whether to fallback based on error conditions
      const errorMessage = (error as any)?.message || (response && !response.success ? response.error : '');
      const shouldFallbackFromSupabase = usedProvider === 'supabase' && (
        errorMessage?.toLowerCase().includes('already registered') ||
        errorMessage?.toLowerCase().includes('already signed up') ||
        errorMessage?.toLowerCase().includes('can only send testing emails') ||
        errorMessage?.toLowerCase().includes('testing') ||
        !!error
      );
      const shouldFallbackFromResend = usedProvider === 'resend' && (
        errorMessage?.toLowerCase().includes('domain verification required') ||
        errorMessage?.toLowerCase().includes('invalid from address') ||
        errorMessage?.toLowerCase().includes('resend_api_key') ||
        !!error
      );

      if ((shouldFallbackFromSupabase || shouldFallbackFromResend)) {
        console.warn(`Primary provider ${usedProvider} failed, attempting fallback...`, { errorMessage });
        usedProvider = usedProvider === 'supabase' ? 'resend' : 'supabase';
        const fallbackResult = await fallback(request);
        response = fallbackResult.data as any;
        error = fallbackResult.error as any;
      }

      if (error) {
        console.error(`Error sending email via ${usedProvider}:`, error);

        if ((error as any).message?.includes('Domain verification required')) {
          toast.error(
            'Email domain not verified. Please verify your domain at resend.com/domains or contact your administrator.',
            { duration: 6000 }
          );
          return { success: false, error: 'Domain verification required' };
        }

        if ((error as any).message?.toLowerCase().includes('can only send testing emails')) {
          toast.error(
            'Email service is in testing mode. Please contact your administrator to set up a verified domain.',
            { duration: 6000 }
          );
          return { success: false, error: 'Email service in testing mode' };
        }

        toast.error(`Failed to send ${request.isResend ? 'resend' : 'send'} activation email`);
        return { success: false, error: (error as any).message };
      }

      if (!response?.success) {
        const msg = response?.error || 'Failed to send activation email';
        toast.error(msg);
        return { success: false, error: msg };
      }

      const action = request.isResend ? 'resent' : 'sent';
      toast.success(`Activation email ${action} successfully!`);

      if (response.activationUrl) {
        try {
          if (typeof window !== 'undefined' && (window as any).navigator?.clipboard?.writeText) {
            await (window as any).navigator.clipboard.writeText(response.activationUrl);
            toast.success('Dev: Activation link copied to clipboard.');
          } else {
            console.log('Activation URL:', response.activationUrl);
            toast.success('Dev: Activation link available in console.');
          }
        } catch (e) {
          console.log('Activation URL:', response.activationUrl);
          toast.success('Dev: Activation link available in console.');
        }
      }

      return {
        success: true,
        message: response.message,
        provider: usedProvider,
        emailId: response.emailId,
        activationUrl: response.activationUrl
      };

    } catch (error: any) {
      console.error(`Error in ${usedProvider} email service:`, error);
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
