
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
  
  const { data: laundries, error } = await supabase
    .from('laundries')
    .select('*')
    .eq('contact_email', email.trim())
    .eq('contact_phone', phone.trim());
  
  if (error) {
    console.error("Error searching for laundry:", error);
    throw error;
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
