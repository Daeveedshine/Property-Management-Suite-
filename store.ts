
import { User, Property, Agreement, Payment, MaintenanceTicket, Notification, UserRole, PropertyStatus, TicketStatus, TicketPriority, NotificationType } from './types';

const STORAGE_KEY = 'prop_lifecycle_data';

interface AppState {
  users: User[];
  properties: Property[];
  agreements: Agreement[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  notifications: Notification[];
  currentUser: User | null;
}

const initialData: AppState = {
  users: [
    { id: 'u1', name: 'Alex Agent', email: 'agent@example.com', role: UserRole.AGENT, phone: '+1 (555) 999-0001' },
    { id: 'u2', name: 'Terry Tenant', email: 'tenant@example.com', role: UserRole.TENANT, assignedPropertyId: 'p1', phone: '+1 (555) 123-4567' },
    { id: 'u3', name: 'Bob Buyer', email: 'buyer@example.com', role: UserRole.TENANT, phone: '+1 (555) 444-5555' },
    { id: 'u4', name: 'Sarah Admin', email: 'admin@example.com', role: UserRole.ADMIN, phone: '+1 (555) 000-0000' },
  ],
  properties: [
    { id: 'p1', name: 'Sunset Apartments #402', location: '123 Sky Ln, Miami', rent: 2500, status: PropertyStatus.OCCUPIED, agentId: 'u1', tenantId: 'u2' },
    { id: 'p2', name: 'Downtown Loft', location: '55 Main St, Chicago', rent: 3200, status: PropertyStatus.VACANT, agentId: 'u1' },
    { id: 'p3', name: 'Oak Ridge Villa', location: '88 Forest Rd, Seattle', rent: 4500, status: PropertyStatus.LISTED, agentId: 'u1' },
  ],
  agreements: [
    { id: 'a1', propertyId: 'p1', tenantId: 'u2', version: 1, startDate: '2023-01-01', endDate: '2024-12-31', status: 'active', documentUrl: 'https://example.com/lease_v1.pdf' },
  ],
  payments: [
    { id: 'pay1', propertyId: 'p1', tenantId: 'u2', amount: 2500, date: '2023-11-01', status: 'paid' },
    { id: 'pay2', propertyId: 'p1', tenantId: 'u2', amount: 2500, date: '2023-12-01', status: 'pending' },
    { id: 'pay3', propertyId: 'p1', tenantId: 'u2', amount: 2500, date: '2024-01-01', status: 'pending' },
  ],
  tickets: [
    { id: 't1', propertyId: 'p1', tenantId: 'u2', issue: 'Leaking faucet in kitchen', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, createdAt: new Date().toISOString() },
  ],
  notifications: [
    { 
      id: 'n1', 
      userId: 'u1', 
      title: 'Rent Overdue', 
      message: 'Terry Tenant is 5 days late on rent for Sunset Apartments #402.', 
      type: NotificationType.WARNING, 
      timestamp: new Date().toISOString(), 
      isRead: false,
      linkTo: 'payments'
    },
    { 
      id: 'n2', 
      userId: 'u2', 
      title: 'Rent Reminder', 
      message: 'Your rent of $2,500 is due in 3 days.', 
      type: NotificationType.INFO, 
      timestamp: new Date().toISOString(), 
      isRead: false,
      linkTo: 'payments'
    },
  ],
  currentUser: null,
};

export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialData;
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
