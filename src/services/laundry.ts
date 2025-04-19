
import { supabase } from "@/integrations/supabase/client";
import { LaundryLocation } from "@/types";
import { convertToLaundry, LaundryDB } from "@/types/laundry";

interface CreateLaundryParams {
  name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  owner_id: string;
}

export async function createLaundryInDB(params: CreateLaundryParams) {
  const { data, error } = await supabase
    .from('laundries')
    .insert({
      name: params.name,
      address: params.address,
      contact_phone: params.contact_phone,
      contact_email: params.contact_email,
      owner_id: params.owner_id,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase error creating laundry:", error);
    throw new Error(`Erro ao criar lavanderia: ${error.message}`);
  }
  
  console.log("Laundry created successfully:", data);
  return convertToLaundry(data as LaundryDB);
}
