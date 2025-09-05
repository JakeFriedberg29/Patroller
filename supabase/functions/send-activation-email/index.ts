import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

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
    // Use service role key for database operations and admin auth functions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId, email, fullName, isResend = false }: SendActivationEmailRequest = await req.json();

    console.log(`${isResend ? 'Resending' : 'Sending'} activation link for user:`, { userId, email });

    // Get user data from database to include metadata in invitation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, organization_id, profile_data')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      throw new Error('User not found');
    }

    try {
      // Generate activation token for the user (already exists in profile_data)
      const activationToken = userData.profile_data?.activation_token;
      
      if (!activationToken) {
        throw new Error('No activation token found for user');
      }

      const baseUrl = req.headers.get('origin') || 'https://6c039858-7863-42e5-8960-ab1a72f8f4e3.sandbox.lovable.dev';
      const activationLink = `${baseUrl}/activate?token=${activationToken}`;
      
      console.log('Generated activation link for user:', { userId, email, activationLink });

      // Update user profile with sent timestamp
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_data: {
            ...userData.profile_data,
            [`${isResend ? 'resent' : 'sent'}_at`]: new Date().toISOString(),
            activation_link_generated: true
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        // Don't throw here as the link was generated successfully
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Activation link generated successfully. Please share this link with the user.`,
        activationLink: activationLink,
        userEmail: email,
        userName: fullName
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } catch (authError: any) {
      console.error('Auth invitation error:', authError);
      throw new Error(authError.message || 'Failed to generate activation link');
    }

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