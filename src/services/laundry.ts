
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

export interface CreateLaundryParams {
  name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  owner_id: string;
}

export async function createLaundryInDB(params: CreateLaundryParams) {
  try {
    console.log("Creating laundry with params:", params);
    
    // Use the edge function to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('manage-laundries', {
      body: {
        action: 'create',
        laundry: {
          name: params.name,
          address: params.address,
          contact_phone: params.contact_phone,
          contact_email: params.contact_email,
          owner_id: params.owner_id,
          status: 'active'
        }
      }
    });

    if (error) {
      console.error("Edge function error creating laundry:", error);
      throw new Error(`Erro ao criar lavanderia: ${error.message}`);
    }
    
    if (!data || data.error) {
      console.error("Service error creating laundry:", data?.error || "Unknown error");
      throw new Error(`Erro ao criar lavanderia: ${data?.error || "Erro desconhecido"}`);
    }
    
    console.log("Laundry created successfully:", data.laundry);
    return convertToLaundry(data.laundry as LaundryDB);
  } catch (error: any) {
    console.error("Error creating laundry:", error);
    throw error;
  }
}
