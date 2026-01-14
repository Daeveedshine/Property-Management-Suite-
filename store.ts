import { User, Property, Agreement, Payment, MaintenanceTicket, Notification, UserRole, PropertyStatus, TicketStatus, TicketPriority, NotificationType, TenantApplication, ApplicationStatus, PropertyCategory } from './types';

const STORAGE_KEY = 'prop_lifecycle_data';

interface AppState {
  users: User[];
  properties: Property[];
  agreements: Agreement[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  notifications: Notification[];
  applications: TenantApplication[];
  currentUser: User | null;
  theme: 'light' | 'dark';
}

const initialData: AppState = {
  users: [
    { id: 'u1', name: 'Alex Agent', email: 'agent@example.com', role: UserRole.AGENT, phone: '+234 801 234 5678' },
    { id: 'u2', name: 'Terry Tenant', email: 'tenant@example.com', role: UserRole.TENANT, assignedPropertyId: 'p1', phone: '+234 802 345 6789' },
    { id: 'u3', name: 'Bob Applicant', email: 'bob@example.com', role: UserRole.TENANT, phone: '+234 803 456 7890' },
    { id: 'u4', name: 'Sarah Admin', email: 'admin@example.com', role: UserRole.ADMIN, phone: '+234 804 567 8901' },
  ],
  properties: [
    { id: 'p1', name: 'Sunset Apartments #402', location: 'Victoria Island, Lagos', rent: 2500000, status: PropertyStatus.OCCUPIED, agentId: 'u1', tenantId: 'u2', category: PropertyCategory.RESIDENTIAL, type: '2 Bedroom flat', description: 'Luxury 2 bedroom apartment with breathtaking ocean views.', rentStartDate: '2024-01-01', rentExpiryDate: '2024-12-31' },
    { id: 'p2', name: 'Downtown Loft', location: 'Maitama, Abuja', rent: 3200000, status: PropertyStatus.VACANT, agentId: 'u1', category: PropertyCategory.RESIDENTIAL, type: 'Studio Appartment', description: 'Modern studio loft in the heart of the city.' },
    { id: 'p3', name: 'Oak Ridge Villa', location: 'Lekki Phase 1, Lagos', rent: 4500000, status: PropertyStatus.LISTED, agentId: 'u1', category: PropertyCategory.RESIDENTIAL, type: 'Fully Detached Duplex', description: 'Spacious duplex with private garden and security.' },
  ],
  agreements: [
    { id: 'a1', propertyId: 'p1', tenantId: 'u2', version: 1, startDate: '2023-01-01', endDate: '2024-12-31', status: 'active', documentUrl: 'https://example.com/lease_v1.pdf' },
  ],
  payments: [
    { id: 'pay1', propertyId: 'p1', tenantId: 'u2', amount: 2500000, date: '2023-11-01', status: 'paid' },
  ],
  tickets: [
    { id: 't1', propertyId: 'p1', tenantId: 'u2', issue: 'Leaking faucet in kitchen', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, createdAt: new Date().toISOString() },
  ],
  notifications: [],
  applications: [
    {
      id: 'app1',
      userId: 'u3',
      propertyId: 'PENDING',
      agentId: 'u1', 
      status: ApplicationStatus.PENDING,
      submissionDate: new Date().toISOString(),
      firstName: 'Bob',
      surname: 'Applicant',
      middleName: 'Olu',
      dob: '1990-05-15',
      maritalStatus: 'Single',
      gender: 'Male',
      currentHomeAddress: '789 Birch St, Ikeja',
      occupation: 'Senior Engineer',
      familySize: 2,
      phoneNumber: '+234 803 456 7890',
      reasonForRelocating: 'Relocation for work',
      currentLandlordName: 'John Smith',
      currentLandlordPhone: '+234 805 111 2222',
      verificationType: 'NIN',
      verificationIdNumber: '23456789012',
      verificationUrl: 'https://images.unsplash.com/photo-1557064820-1c913d98fb73?auto=format&fit=crop&q=80&w=400',
      passportPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      agentIdCode: 'u1',
      signature: 'Bob Applicant',
      applicationDate: new Date().toISOString().split('T')[0],
      riskScore: 85,
      aiRecommendation: 'Stable income and good rental history. Recommend approval.'
    }
  ],
  currentUser: null,
  theme: 'dark',
};

export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialData;
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
