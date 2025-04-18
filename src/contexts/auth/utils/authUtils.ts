
import { supabase } from '@/integrations/supabase/client';

export const updateUserRole = async (userId: string, role: 'business' | 'user' | 'admin') => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  
  if (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const checkLaundryOwnership = async (email: string, phone: string) => {
  console.log("Searching for laundry with email:", email, "and phone:", phone);
  
  // Log all laundries for debugging
  const { data: allLaundries } = await supabase
    .from('laundries')
    .select('*');
  
  console.log("All laundries in database:", allLaundries);
  
  // Primeiro tentativa exata
  const { data: laundries, error } = await supabase
    .from('laundries')
    .select('*')
    .eq('contact_email', email.trim())
    .eq('contact_phone', phone.trim());
  
  if (error) {
    console.error("Error searching for laundry:", error);
    throw error;
  }
  
  // Se não encontrar com correspondência exata, tenta busca mais flexível
  if (!laundries || laundries.length === 0) {
    console.log("No exact match, trying case-insensitive search");
    const { data: flexLaundries } = await supabase
      .from('laundries')
      .select('*')
      .ilike('contact_email', `%${email.trim()}%`);
    
    console.log("Flexible search results:", flexLaundries);
    
    if (flexLaundries && flexLaundries.length > 0) {
      // Verifica manualmente qual lavanderia tem o telefone mais próximo
      const matchingLaundry = flexLaundries.find(
        laundry => laundry.contact_phone.replace(/\D/g, '') === phone.trim().replace(/\D/g, '')
      );
      
      if (matchingLaundry) {
        console.log("Found matching laundry with flexible search:", matchingLaundry);
        return matchingLaundry;
      }
    }
  }
  
  return laundries?.[0] || null;
};

export const updateLaundryOwner = async (laundryId: string, ownerId: string) => {
  const { error } = await supabase
    .from('laundries')
    .update({ owner_id: ownerId })
    .eq('id', laundryId);
  
  if (error) {
    console.error("Error updating laundry owner:", error);
    throw error;
  }
};

export const updateUserContact = async (userId: string, email: string, phone: string) => {
  console.log(`Updating user ${userId} profile with contact information from laundry`);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      contact_email: email,
      contact_phone: phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error("Error updating user contact information:", error);
    
    // Se o erro for porque as colunas não existem, tenta criar elas
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      console.log("Contact columns might not exist in profiles table, continuing without update");
    } else {
      throw error;
    }
  } else {
    console.log("Successfully updated user contact information");
  }
};
