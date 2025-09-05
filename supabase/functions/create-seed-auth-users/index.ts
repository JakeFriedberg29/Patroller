import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting to create auth users for seed data...')

    // Get all users without auth_user_id
    const { data: usersToCreate, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .is('auth_user_id', null)

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      throw fetchError
    }

    console.log(`Found ${usersToCreate?.length || 0} users to create auth accounts for`)

    const results = []

    // Create auth users for each user in our database
    for (const user of usersToCreate || []) {
      try {
        console.log(`Creating auth user for: ${user.email}`)
        
        // Create auth user with email as password
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.email, // Using email as password as requested
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: user.full_name
          }
        })

        if (authError) {
          console.error(`Error creating auth user for ${user.email}:`, authError)
          results.push({ 
            user_id: user.id, 
            email: user.email, 
            success: false, 
            error: authError.message 
          })
          continue
        }

        // Update the user record with the auth_user_id
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ auth_user_id: authUser.user.id })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error updating user ${user.email} with auth_user_id:`, updateError)
          results.push({ 
            user_id: user.id, 
            email: user.email, 
            success: false, 
            error: updateError.message 
          })
        } else {
          console.log(`Successfully created auth user for: ${user.email}`)
          results.push({ 
            user_id: user.id, 
            email: user.email, 
            auth_user_id: authUser.user.id,
            success: true 
          })
        }
        
      } catch (error) {
        console.error(`Exception creating auth user for ${user.email}:`, error)
        results.push({ 
          user_id: user.id, 
          email: user.email, 
          success: false, 
          error: error.message 
        })
      }
    }

    console.log('Completed creating auth users')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created auth users for ${results.filter(r => r.success).length} out of ${results.length} users`,
        results 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in create-seed-auth-users function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})