
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
    ownerId: '2',
    machines: []
  },
  {
    id: '2',
    name: 'Lavanderia Shopping',
    address: 'Shopping Top Center, Loja 45',
    ownerId: '2',
    machines: []
  }
];

export const mockMachines: Machine[] = [
  {
    id: '1',
    type: 'washer',
    status: 'available',
    price: 12.50,
    timeMinutes: 45,
    locationId: '1'
  },
  {
    id: '2',
    type: 'dryer',
    status: 'available',
    price: 8.00,
    timeMinutes: 30,
    locationId: '1'
  },
  {
    id: '3',
    type: 'washer',
    status: 'in-use',
    price: 12.50,
    timeMinutes: 45,
    locationId: '1'
  },
  {
    id: '4',
    type: 'washer',
    status: 'available',
    price: 15.00,
    timeMinutes: 60,
    locationId: '2'
  },
  {
    id: '5',
    type: 'dryer',
    status: 'maintenance',
    price: 10.00,
    timeMinutes: 40,
    locationId: '2'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    machineId: '1',
    amount: 12.50,
    status: 'approved',
    method: 'credit',
    createdAt: new Date('2023-04-15T14:30:00'),
    transactionId: 'mp_12345678'
  },
  {
    id: '2',
    machineId: '2',
    amount: 8.00,
    status: 'approved',
    method: 'pix',
    createdAt: new Date('2023-04-15T15:20:00'),
    transactionId: 'mp_87654321'
  },
  {
    id: '3',
    machineId: '4',
    amount: 15.00,
    status: 'pending',
    method: 'debit',
    createdAt: new Date('2023-04-15T16:15:00')
  }
];

// Preparar os dados para uso
mockLocations.forEach(location => {
  location.machines = mockMachines.filter(machine => machine.locationId === location.id);
});
