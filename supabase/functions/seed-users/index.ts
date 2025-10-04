import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const usersToCreate = [
      { email: 'sarah.johnson@megacorp.com', full_name: 'Sarah Johnson', user_id: 'b1a11a11-1111-4111-a111-111111111111' },
      { email: 'mike.chen@megacorp.com', full_name: 'Mike Chen', user_id: 'b2b22b22-2222-4222-b222-222222222222' },
      { email: 'emily.rodriguez@megacorp.com', full_name: 'Dr. Emily Rodriguez', user_id: 'b3c33c33-3333-4333-c333-333333333333' },
      { email: 'robert.davis@megacorp.com', full_name: 'Robert Davis', user_id: 'b4d44d44-4444-4444-d444-444444444444' },
      { email: 'lisa.thompson@megacorp.com', full_name: 'Dr. Lisa Thompson', user_id: 'b5e55e55-5555-4555-e555-555555555555' },
      { email: 'james.wilson@megacorp.com', full_name: 'James Wilson', user_id: 'b6f66f66-6666-4666-f666-666666666666' },
      { email: 'sarah.johnson@example.com', full_name: 'Sarah Johnson', user_id: 'b7777a77-7777-4777-a777-777777777777' },
      { email: 'mike.chen@example.com', full_name: 'Mike Chen', user_id: 'b8888b88-8888-4888-b888-888888888888' },
      { email: 'emily.rodriguez@example.com', full_name: 'Emily Rodriguez', user_id: 'b9999c99-9999-4999-c999-999999999999' },
    ];

    const { data: existingUsers, error: queryError } = await supabaseAdmin
      .from('users')
      .select('id, email, auth_user_id')
      .in('id', usersToCreate.map(u => u.user_id));

    if (queryError) {
      return new Response(JSON.stringify({ error: 'Failed to check existing users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];
    let processedCount = 0;

    for (const userData of usersToCreate) {
      try {
        const existingUser = existingUsers?.find(u => u.id === userData.user_id);
        if (!existingUser) {
          results.push({ email: userData.email, success: false, error: 'User not found in database' });
          continue;
        }

        if (existingUser.auth_user_id) {
          results.push({ email: userData.email, success: true, message: 'Already linked to auth account', auth_user_id: existingUser.auth_user_id });
          continue;
        }

        processedCount++;
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listError) {
          results.push({ email: userData.email, success: false, error: `Failed to check existing auth users: ${listError.message}` });
          continue;
        }
        const existingAuthUser = authUsers.users.find(u => u.email === userData.email);
        if (existingAuthUser) {
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ auth_user_id: existingAuthUser.id, status: 'active', email_verified: true })
            .eq('id', userData.user_id);
          if (updateError) {
            results.push({ email: userData.email, success: false, error: `Failed to link existing auth user: ${updateError.message}` });
            continue;
          }
          results.push({ email: userData.email, success: true, message: 'Linked existing auth user', auth_user_id: existingAuthUser.id });
        } else {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.email,
            email_confirm: true,
            user_metadata: { full_name: userData.full_name },
          });
          if (authError) {
            results.push({ email: userData.email, success: false, error: authError.message });
            continue;
          }
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ auth_user_id: (authUser as any).user.id, status: 'active', email_verified: true })
            .eq('id', userData.user_id);
          if (updateError) {
            results.push({ email: userData.email, success: false, error: `Auth user created but failed to link: ${updateError.message}` });
            continue;
          }
          results.push({ email: userData.email, success: true, message: 'Created new auth user', auth_user_id: (authUser as any).user.id });
        }
      } catch (error: any) {
        results.push({ email: userData.email, success: false, error: error.message });
      }
    }

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    const message = successfulResults.length > 0
      ? `Successfully processed ${successfulResults.length} authentication accounts`
      : processedCount === 0
        ? 'No new seed users to create - all seed/mock users already have authentication accounts linked'
        : 'No authentication accounts could be processed';

    return new Response(
      JSON.stringify({
        message,
        details: processedCount === 0 ? 'All seed/mock users already have authentication accounts. No new auth users needed.' : undefined,
        results,
        total_processed: results.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        skipped: 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});


