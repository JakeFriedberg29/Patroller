import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { ActivationEmail } from './_templates/activation-email.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateInvitationRequest {
  userId: string;
  email: string;
  fullName: string;
  isResend?: boolean;
  organizationName?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const origin = req.headers.get('origin') || '';
    const isDevOrigin = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.dev');

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFrom = Deno.env.get('RESEND_FROM') || 'Patroller <notifications@patroller.io>';
    const resend = resendApiKey ? new Resend(resendApiKey as string) : null;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userId, email, fullName, isResend = false, organizationName }: CreateInvitationRequest = await req.json();

    if (!userId || !email || !fullName) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, email, fullName' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, organization_id, profile_data')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate activation token via DB function for custom activation flow
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_activation_token', { p_user_id: userId });

    if (tokenError || !tokenData?.success) {
      console.error('Error generating activation token:', tokenError || tokenData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate activation token. User may not be in pending status or token generation failed.',
          details: tokenError?.message || tokenData?.error || 'Unknown error'
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use Patroller branded domain - prefer PUBLIC_SITE_URL env, fallback to Patroller domain
    // Don't use request origin to avoid development/staging URLs in production emails
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://app.patroller.io';
    const activationUrl = `${baseUrl}/activate?token=${tokenData.activation_token}`;

    const firstName = fullName.split(' ')[0];
    const orgName = organizationName || 'Patroller Platform';

    // Render React Email template
    const emailHtml = await renderAsync(
      React.createElement(ActivationEmail, {
        firstName,
        organizationName: orgName,
        activationUrl,
        isResend,
      })
    );

    const emailText = `
Hi ${firstName},

Welcome to the Patroller Console!

To complete your registration and activate your account, please confirm your email by clicking the link below. You'll then be prompted to set your password and get started.

${activationUrl}

If you didn't expect this email for Patroller, you can safely ignore this message.

Thanks,
The Patroller Team
    `;

    const sendSupabaseInviteFallback = async (): Promise<Response> => {
      console.warn('Falling back to Supabase invite...');
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            full_name: fullName,
            tenant_id: userData.tenant_id,
            organization_id: userData.organization_id,
            user_id: userId,
            invited_by_admin: true,
          },
          redirectTo: `${baseUrl}/auth`,
        }
      );

      if (inviteError) {
        console.error('Supabase invite fallback error:', inviteError);
        throw new Error(`Supabase invite fallback failed: ${inviteError.message}`);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_data: {
            ...userData.profile_data,
            activation_sent_at: new Date().toISOString(),
            supabase_invite_sent: true,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile after fallback:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation ${isResend ? 'resent' : 'sent'} via Supabase`,
          inviteData,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    };

    try {
      if (!resend) {
        console.warn('RESEND_API_KEY is not set. Using Supabase invite.');
        return await sendSupabaseInviteFallback();
      }

      const emailResponse = await resend.emails.send({
        from: resendFrom,
        to: [email],
        subject: `${isResend ? 'Reminder: ' : ''}Activate your Patroller account`,
        html: emailHtml,
        text: emailText,
        headers: { 'X-Entity-Ref-ID': userId },
        tags: [
          { name: 'category', value: 'user_invitation' },
          { name: 'user_id', value: userId },
        ],
      });

      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_data: {
            ...userData.profile_data,
            activation_sent_at: new Date().toISOString(),
            resend_email_sent: true,
            email_id: (emailResponse as any).data?.id,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation ${isResend ? 'resent' : 'sent'} successfully via Resend`,
          emailId: (emailResponse as any).data?.id,
          activationUrl: isDevOrigin ? activationUrl : undefined,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (emailError: any) {
      console.error('Resend email error:', emailError);
      const msg = emailError?.message || '';
      const domainIssue = msg.includes('You can only send testing emails') || msg.includes('Invalid from address') || msg.includes('Domain verification required');

      if (domainIssue && isDevOrigin) {
        console.warn('Domain verification issue in dev. Returning activationUrl for manual delivery.');
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Dev mode: Domain not verified. Use activationUrl to proceed.',
            emailId: null,
            activationUrl,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      try {
        return await sendSupabaseInviteFallback();
      } catch (fallbackError: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to send via Resend and fallback failed: ${fallbackError.message || msg}`,
            code: emailError?.code || 'UNKNOWN_ERROR',
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }
  } catch (error: any) {
    console.error('Error in invitations function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});


