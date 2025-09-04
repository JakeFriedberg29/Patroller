import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendActivationEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { userId, email, fullName, isResend = false }: SendActivationEmailRequest = await req.json();

    console.log(`${isResend ? 'Resending' : 'Sending'} activation email for user:`, { userId, email });

    // Generate new activation token using our database function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_activation_token', { p_user_id: userId });

    if (tokenError) {
      console.error('Error generating activation token:', tokenError);
      throw new Error('Failed to generate activation token');
    }

    const activationToken = tokenData.activation_token;

    // Update user profile with sent timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile_data: supabase.raw(`profile_data || '{"activation_sent_at": "${new Date().toISOString()}"}'::jsonb`),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new Error('Failed to update user profile');
    }

    // Generate temporary password (12 chars, meets requirements)
    const generateTempPassword = (): string => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const special = '!@#$%^&*';
      
      // Ensure at least one of each required character type
      let password = '';
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];
      
      // Fill remaining 8 characters
      const allChars = uppercase + lowercase + numbers + special;
      for (let i = 4; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const tempPassword = generateTempPassword();
    
    // Create the activation URL for our custom activation flow
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/activate?token=${encodeURIComponent(activationToken)}`;

    // Send activation email
    const emailResponse = await resend.emails.send({
      from: "Mission Portal <onboarding@resend.dev>",
      to: [email],
      subject: `${isResend ? 'Resent: ' : ''}Your Mission Portal Account Activation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1a202c; margin-bottom: 20px; text-align: center;">Welcome to Mission Portal</h1>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              Hello ${fullName},
            </p>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              Your administrator has ${isResend ? 'resent your' : 'created your'} Mission Portal account. To get started, please use the following temporary credentials:
            </p>
            
            <div style="background-color: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #2d3748;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #2d3748;"><strong>Temporary Password:</strong> <code style="background-color: #cbd5e0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Activate Your Account
              </a>
            </div>
            
            <div style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #c05621;">Important Security Notice</h3>
              <p style="margin: 0; color: #744210; font-size: 14px;">
                You will be required to change this temporary password on your first login. Please ensure your new password meets our security requirements:
              </p>
              <ul style="color: #744210; font-size: 14px; margin: 10px 0 0 20px;">
                <li>Minimum 12 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number and special character</li>
                <li>Cannot contain your name or email address</li>
              </ul>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              If you didn't expect this email or have any questions, please contact your administrator immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
              This email was sent from Mission Portal. This link will expire in 24 hours for security purposes.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Activation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Activation email ${isResend ? 'resent' : 'sent'} successfully`,
      activationToken: activationToken
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-activation-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);