import { supabase } from "@/integrations/supabase/client";

export async function createSeedAuthUsers() {
  try {
    console.log('Calling create-seed-auth-users function...');
    
    const { data, error } = await supabase.functions.invoke('create-seed-auth-users', {
      body: {}
    });

    if (error) {
      console.error('Error calling create-seed-auth-users:', error);
      return { success: false, error: error.message };
    }

    console.log('Seed auth users created successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Unexpected error calling create-seed-auth-users:', error);
    return { success: false, error: error.message };
  }
}