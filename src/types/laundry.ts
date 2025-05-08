
// DB type to match what's coming from the database
export type LaundryDB = {
  id: string;
  name: string;
  address: string;
  owner_id: string;
  status?: string;
  contact_phone: string;
  contact_email: string;
  created_at?: string;
  updated_at?: string;
  latitude?: number | null;
  longitude?: number | null;
};

// Convert database laundry to app laundry
export const convertToLaundry = (dbLaundry: LaundryDB) => ({
  id: dbLaundry.id,
  name: dbLaundry.name,
  address: dbLaundry.address,
  owner_id: dbLaundry.owner_id,
  contact_phone: dbLaundry.contact_phone,
  contact_email: dbLaundry.contact_email,
  status: dbLaundry.status,
  created_at: dbLaundry.created_at,
  updated_at: dbLaundry.updated_at
});
