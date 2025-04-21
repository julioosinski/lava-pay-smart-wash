
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'business' | 'customer';
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
  machine_number: number;
  store_id: string;
  machine_serial: string;
  stone_code?: string;
  stone_terminal_id?: string;
  elgin_terminal_id?: string;
  mercadopago_terminal_id?: string;
  current_session_start?: string;
  expected_end_time?: string;
  current_payment_id?: string;
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
  laundry_id?: string;
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

export interface BusinessOwner {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface MachineCommand {
  id: string;
  machine_id: string;
  command: string;
  params?: Record<string, any>;
  sent_at: string;
  received_at?: string;
  status: 'pending' | 'received' | 'error';
  error_message?: string;
  created_at: string;
}
