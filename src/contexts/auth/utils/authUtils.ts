
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
  
  // First create a test laundry if none exist (for development purposes)
  const { data: allLaundries } = await supabase
    .from('laundries')
    .select('*');
  
  console.log("All laundries in database:", allLaundries);
  
  // For testing: if no laundries exist, create one with the provided credentials
  if (!allLaundries || allLaundries.length === 0) {
    console.log("No laundries found in database, creating test laundry");
    const { data: newLaundry, error } = await supabase
      .from('laundries')
      .insert({
        name: 'Test Laundry',
        contact_email: email.trim(),
        contact_phone: phone.trim(),
        address: 'Test Address',
        status: 'active'
      })
      .select();
    
    if (error) {
      console.error("Error creating test laundry:", error);
    } else {
      console.log("Created test laundry:", newLaundry);
      return newLaundry[0];
    }
  }
  
  // Try exact match first
  const { data: laundries, error } = await supabase
    .from('laundries')
    .select('*')
    .eq('contact_email', email.trim())
    .eq('contact_phone', phone.trim());
  
  if (error) {
    console.error("Error searching for laundry:", error);
    throw error;
  }
  
  // If no exact match, try more flexible search
  if (!laundries || laundries.length === 0) {
    console.log("No exact match, trying case-insensitive search");
    
    // First by email
    const { data: emailLaundries } = await supabase
      .from('laundries')
      .select('*')
      .ilike('contact_email', `%${email.trim()}%`);
    
    console.log("Email flexible search results:", emailLaundries);
    
    if (emailLaundries && emailLaundries.length > 0) {
      // Check if any have a similar phone
      const normalizedPhone = phone.trim().replace(/\D/g, '');
      
      for (const laundry of emailLaundries) {
        const laundryPhone = laundry.contact_phone.replace(/\D/g, '');
        if (laundryPhone.includes(normalizedPhone) || normalizedPhone.includes(laundryPhone)) {
          console.log("Found matching laundry with flexible search:", laundry);
          return laundry;
        }
      }
    }
    
    // If still no match, try by phone
    const { data: phoneLaundries } = await supabase
      .from('laundries')
      .select('*')
      .ilike('contact_phone', `%${phone.trim().replace(/\D/g, '')}%`);
    
    console.log("Phone flexible search results:", phoneLaundries);
    
    if (phoneLaundries && phoneLaundries.length > 0) {
      // Return the first match
      console.log("Found laundry matching by phone:", phoneLaundries[0]);
      return phoneLaundries[0];
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
    
    // If columns don't exist, create them
    if (error.message.includes("column") && error.message.includes("does not exist")) {
      console.log("Contact columns might not exist in profiles table, adding them");
      
      try {
        // Call the helper table that triggers the function to add columns
        const { error: insertError } = await supabase
          .from('add_contact_fields_to_profiles_call')
          .insert({ dummy: true });
        
        if (insertError) {
          console.error("Error triggering add_contact_fields_to_profiles function:", insertError);
        } else {
          console.log("Successfully triggered add_contact_fields_to_profiles function");
          
          // Try update again
          setTimeout(async () => {
            const { error: retryError } = await supabase
              .from('profiles')
              .update({
                contact_email: email,
                contact_phone: phone,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
              
            if (retryError) {
              console.error("Error in retry of updating user contact:", retryError);
            } else {
              console.log("Successfully added fields and updated user contact");
            }
          }, 1000); // Give it a second for the function to complete
        }
      } catch (e) {
        console.error("Error triggering add_contact_fields_to_profiles function:", e);
      }
    } else {
      throw error;
    }
  } else {
    console.log("Successfully updated user contact information");
  }
};
