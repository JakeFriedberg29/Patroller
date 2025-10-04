import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { Resend } from "npm:resend@2.0.0";

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
    const resendFrom = Deno.env.get('RESEND_FROM') || 'Platform Admin <onboarding@resend.dev>';
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
      console.error('Error generating activation token:', tokenError);
      // Not fatal if we end up using Supabase invite; continue
    }

    const baseUrl = origin || 'https://response-chain.lovable.app';
    const activationUrl = tokenData?.activation_token
      ? `${baseUrl}/activate?token=${tokenData.activation_token}`
      : `${baseUrl}/auth`;

    const firstName = fullName.split(' ')[0];
    const orgName = organizationName || 'the organization';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${orgName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333333; margin-bottom: 10px;">Welcome to ${orgName}!</h1>
              <p style="color: #666666; font-size: 16px;">You've been invited to join our platform</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">Hello ${firstName},</p>
              <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
                You've been invited to join <strong>${orgName}</strong> on our emergency management platform. 
                To get started, please activate your account by clicking the button below.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${activationUrl}" 
                   style="background-color: #007bff; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Activate Account
                </a>
              </div>
              <p style="color: #666666; font-size: 14px; margin-top: 20px;">
                If the button doesn't work, you can copy and paste this link into your browser:
                <br>
                <a href="${activationUrl}" style="color: #007bff; word-break: break-all;">${activationUrl}</a>
              </p>
            </div>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <h3 style="color: #856404; margin-top: 0;">Important Security Information</h3>
              <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>This invitation link will expire in 24 hours</li>
                <li>If you didn't expect this invitation, please contact your administrator</li>
                <li>Never share your login credentials with anyone</li>
              </ul>
            </div>
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
              <p style="color: #666666; font-size: 14px; margin: 0;">
                Need help? Contact your system administrator or reply to this email.
              </p>
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} ${orgName}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Welcome to ${orgName}!

Hello ${firstName},

You've been invited to join ${orgName} on our emergency management platform.

To get started, please activate your account by visiting this link:
${activationUrl}

Important Security Information:
- This invitation link will expire in 24 hours
- If you didn't expect this invitation, please contact your administrator
- Never share your login credentials with anyone

Need help? Contact your system administrator.

© ${new Date().getFullYear()} ${orgName}. All rights reserved.
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
        subject: `${isResend ? 'Reminder: ' : ''}Welcome to ${orgName} - Account Activation Required`,
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


