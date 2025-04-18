
import { User, LaundryLocation, Machine, Payment } from '../types';

// Dados simulados para demonstração
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin do Sistema',
    email: 'admin@lavapay.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'João da Silva',
    email: 'joao@lavanderia.com',
    role: 'owner'
  },
  {
    id: '3',
    name: 'Cliente Atual',
    email: 'cliente@gmail.com',
    role: 'customer'
  }
];

export const mockLocations: LaundryLocation[] = [
  {
    id: '1',
    name: 'Lavanderia Centro',
    address: 'Rua Central, 123',
    owner_id: '2',
    machines: []
  },
  {
    id: '2',
    name: 'Lavanderia Shopping',
    address: 'Shopping Top Center, Loja 45',
    owner_id: '2',
    machines: []
  }
];

export const mockMachines: Machine[] = [
  {
    id: '1',
    type: 'washer',
    status: 'available',
    price: 12.50,
    time_minutes: 45,
    laundry_id: '1',
    machine_number: 1,
    store_id: 'STORE-001',
    machine_serial: 'SERIAL-W001'
  },
  {
    id: '2',
    type: 'dryer',
    status: 'available',
    price: 8.00,
    time_minutes: 30,
    laundry_id: '1',
    machine_number: 2,
    store_id: 'STORE-002',
    machine_serial: 'SERIAL-D002'
  },
  {
    id: '3',
    type: 'washer',
    status: 'in-use',
    price: 12.50,
    time_minutes: 45,
    laundry_id: '1',
    machine_number: 3,
    store_id: 'STORE-003',
    machine_serial: 'SERIAL-W003'
  },
  {
    id: '4',
    type: 'washer',
    status: 'available',
    price: 15.00,
    time_minutes: 60,
    laundry_id: '2',
    machine_number: 1,
    store_id: 'STORE-004',
    machine_serial: 'SERIAL-W004'
  },
  {
    id: '5',
    type: 'dryer',
    status: 'maintenance',
    price: 10.00,
    time_minutes: 40,
    laundry_id: '2',
    machine_number: 2,
    store_id: 'STORE-005',
    machine_serial: 'SERIAL-D005'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    machine_id: '1',
    amount: 12.50,
    status: 'approved',
    method: 'credit',
    created_at: new Date('2023-04-15T14:30:00'),
    transaction_id: 'mp_12345678',
    user_id: '3'
  },
  {
    id: '2',
    machine_id: '2',
    amount: 8.00,
    status: 'approved',
    method: 'pix',
    created_at: new Date('2023-04-15T15:20:00'),
    transaction_id: 'mp_87654321',
    user_id: '3'
  },
  {
    id: '3',
    machine_id: '4',
    amount: 15.00,
    status: 'pending',
    method: 'debit',
    created_at: new Date('2023-04-15T16:15:00'),
    user_id: '3'
  }
];

// Preparar os dados para uso
mockLocations.forEach(location => {
  location.machines = mockMachines.filter(machine => machine.laundry_id === location.id);
});
