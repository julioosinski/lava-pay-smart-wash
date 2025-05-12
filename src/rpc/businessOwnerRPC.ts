
import { supabase } from "@/integrations/supabase/client";

export async function createListBusinessOwnersRPC() {
  try {
    // We can't check if the RPC exists using rpc() directly,
    // so we'll try to invoke the edge function to create it
    console.log('Creating list_business_owners RPC function...');
    
    const { error: createError } = await supabase.functions.invoke('create-business-owners-rpc', {
      body: { action: 'create' }
    });
    
    if (createError) {
      console.error('Error creating RPC function:', createError);
    } else {
      console.log('RPC function created successfully');
    }
  } catch (error) {
    console.error('Error checking/creating RPC function:', error);
  }
}
