
import { supabase } from "@/integrations/supabase/client";

export async function createListBusinessOwnersRPC() {
  try {
    const { error } = await supabase.rpc('list_business_owners');
    
    // If RPC doesn't exist, create it
    if (error && error.message.includes('does not exist')) {
      console.log('Creating list_business_owners RPC function...');
      
      const { error: createError } = await supabase.functions.invoke('create-business-owners-rpc', {
        body: { action: 'create' }
      });
      
      if (createError) {
        console.error('Error creating RPC function:', createError);
      } else {
        console.log('RPC function created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking/creating RPC function:', error);
  }
}
