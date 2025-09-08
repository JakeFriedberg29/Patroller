import { supabase } from "@/integrations/supabase/client";

export async function cleanupDummyData() {
  try {
    console.log('Calling cleanup-dummy-data function...');
    
    const { data, error } = await supabase.functions.invoke('cleanup-dummy-data', {
      body: {}
    });

    if (error) {
      console.error('Error calling cleanup-dummy-data:', error);
      return { success: false, error: error.message };
    }

    console.log('Dummy data cleanup completed:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Unexpected error calling cleanup-dummy-data:', error);
    return { success: false, error: error.message };
  }
}