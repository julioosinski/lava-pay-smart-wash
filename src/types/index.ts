
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'customer';
}

export interface LaundryLocation {
  id: string;
  name: string;
  address: string;
  contact_phone?: string;
  contact_email?: string;
  owner_id: string;
  machines?: Machine[]; // Make machines optional
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Machine {
  id: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in-use' | 'maintenance';
  price: number;
  time_minutes: number;
  laundry_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  machine_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: 'credit' | 'debit' | 'pix';
  user_id: string;
  created_at: Date;
  transaction_id?: string;
}

export interface Subscription {
  id: string;
  laundry_id: string;
  amount: number;
  billing_day: number;
  next_billing_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}
