import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Creating seed authentication users...')

    // Define users to create with email as password
    const usersToCreate = [
      // Enterprise Admins
      {
        email: 'sarah.johnson@megacorp.com',
        full_name: 'Sarah Johnson',
        user_id: 'b1a11a11-1111-4111-a111-111111111111'
      },
      {
        email: 'mike.chen@megacorp.com', 
        full_name: 'Mike Chen',
        user_id: 'b2b22b22-2222-4222-b222-222222222222'
      },
      {
        email: 'emily.rodriguez@megacorp.com',
        full_name: 'Dr. Emily Rodriguez',
        user_id: 'b3c33c33-3333-4333-c333-333333333333'
      },
      {
        email: 'robert.davis@megacorp.com',
        full_name: 'Robert Davis',
        user_id: 'b4d44d44-4444-4444-d444-444444444444'
      },
      {
        email: 'lisa.thompson@megacorp.com',
        full_name: 'Dr. Lisa Thompson',
        user_id: 'b5e55e55-5555-4555-e555-555555555555'
      },
      {
        email: 'james.wilson@megacorp.com',
        full_name: 'James Wilson',
        user_id: 'b6f66f66-6666-4666-f666-666666666666'
      },
      // Team Members
      {
        email: 'sarah.johnson@example.com',
        full_name: 'Sarah Johnson',
        user_id: 'b7777a77-7777-4777-a777-777777777777'
      },
      {
        email: 'mike.chen@example.com',
        full_name: 'Mike Chen', 
        user_id: 'b8888b88-8888-4888-b888-888888888888'
      },
      {
        email: 'emily.rodriguez@example.com',
        full_name: 'Emily Rodriguez',
        user_id: 'b9999c99-9999-4999-c999-999999999999'
      }
    ]

    const results = []

    for (const userData of usersToCreate) {
      try {
        console.log(`Creating auth user for: ${userData.email}`)
        
        // Create auth user with email as password
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.email, // Using email as password as requested
          email_confirm: true, // Skip email confirmation
          user_metadata: {
            full_name: userData.full_name
          }
        })

        if (authError) {
          console.error(`Error creating auth user for ${userData.email}:`, authError)
          results.push({ 
            email: userData.email, 
            success: false, 
            error: authError.message 
          })
          continue
        }

        console.log(`Auth user created for ${userData.email}, updating database record...`)

        // Update the corresponding user record with auth_user_id
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            auth_user_id: authUser.user.id,
            status: 'active',
            email_verified: true
          })
          .eq('id', userData.user_id)

        if (updateError) {
          console.error(`Error updating user record for ${userData.email}:`, updateError)
          results.push({ 
            email: userData.email, 
            success: false, 
            error: updateError.message 
          })
          continue
        }

        console.log(`Successfully created and linked auth user for: ${userData.email}`)
        results.push({ 
          email: userData.email, 
          success: true, 
          auth_user_id: authUser.user.id 
        })

      } catch (error) {
        console.error(`Unexpected error for ${userData.email}:`, error)
        results.push({ 
          email: userData.email, 
          success: false, 
          error: error.message 
        })
      }
    }

    console.log('Auth user creation complete. Results:', results)

    return new Response(
      JSON.stringify({ 
        message: 'Seed auth user creation completed',
        results: results,
        total_processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Fatal error in create-seed-auth-users function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})