
// Tipos para o sistema de lavanderia

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
  ownerId: string;
  machines: Machine[];
}

export interface Machine {
  id: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in-use' | 'maintenance';
  price: number;
  time_minutes: number; // Changed from timeMinutes to time_minutes to match DB
  laundry_id: string;   // Changed from locationId to laundry_id to match DB
}

export interface Payment {
  id: string;
  machineId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: 'credit' | 'debit' | 'pix';
  createdAt: Date;
  transactionId?: string;
}
