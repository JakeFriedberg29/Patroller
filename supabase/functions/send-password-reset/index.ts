import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { PasswordResetEmail } from './_templates/password-reset-email.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email }: PasswordResetRequest = await req.json();

    console.log('Processing password reset request for:', email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user exists
    const { data: authUser, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error checking user:', userError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If the email exists, a reset link has been sent' 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const user = authUser.users.find(u => u.email === email);
    
    if (!user) {
      console.log('User not found, but returning success for security');
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If the email exists, a reset link has been sent' 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/reset-password`,
      }
    });

    if (resetError || !resetData) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    const resetUrl = resetData.properties?.action_link || '';
    
    console.log('Reset link generated successfully');

    // Render the React Email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        resetUrl,
        userEmail: email,
      })
    );

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Platform <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your Password',
      html,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw emailError;
    }

    console.log('Password reset email sent successfully:', emailData?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        emailId: emailData?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send password reset email'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
