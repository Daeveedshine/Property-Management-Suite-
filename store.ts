
import { User, Property, Agreement, Payment, MaintenanceTicket, Notification, UserRole, PropertyStatus, TicketStatus, TicketPriority, NotificationType, TenantApplication, ApplicationStatus } from './types';

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
}

const initialData: AppState = {
  users: [
    { id: 'u1', name: 'Alex Agent', email: 'agent@example.com', role: UserRole.AGENT, phone: '+1 (555) 999-0001' },
    { id: 'u2', name: 'Terry Tenant', email: 'tenant@example.com', role: UserRole.TENANT, assignedPropertyId: 'p1', phone: '+1 (555) 123-4567' },
    { id: 'u3', name: 'Bob Applicant', email: 'bob@example.com', role: UserRole.TENANT, phone: '+1 (555) 444-5555' },
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
  ],
  tickets: [
    { id: 't1', propertyId: 'p1', tenantId: 'u2', issue: 'Leaking faucet in kitchen', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, createdAt: new Date().toISOString() },
  ],
  notifications: [],
  applications: [
    {
      id: 'app1',
      userId: 'u3',
      propertyId: 'p2',
      agentId: 'u1', // Initial application correctly routed to Alex Agent
      status: ApplicationStatus.PENDING,
      submissionDate: new Date().toISOString(),
      personalInfo: {
        fullName: 'Bob Applicant',
        gender: 'Male',
        dob: '1990-05-15',
        maritalStatus: 'Single',
        dependents: 0,
        nationality: 'American',
        stateOfOrigin: 'California',
        permanentAddress: '789 Birch St, Miami',
        currentAddress: '789 Birch St, Miami',
        phone: '+1 (555) 444-5555'
      },
      identity: { idType: 'NIN', idNumber: '12345678901', nin: '12345678901', idUrlFront: '', idUrlBack: '', selfieUrl: '' },
      employment: { 
        status: 'Employed', 
        employer: 'Tech Corp', 
        officeAddress: '100 Silicon Way, San Jose',
        workPhone: '+1 (555) 999-8888',
        jobTitle: 'Senior Engineer',
        monthlyIncome: 8500,
        incomeProofUrl: ''
      },
      rentalHistory: { 
        previousLandlord: 'John Smith', 
        landlordPhone: '+1 555-222-3333',
        duration: '2 years',
        monthlyRent: 2000,
        reasonForLeaving: 'Relocation',
        paidOnTime: true
      },
      emergency: {
        name: 'Jane Doe',
        phone: '+1 (555) 777-8888',
        relationship: 'Sister'
      },
      guarantor: { 
        name: 'Alice Mom', 
        phone: '+1 555-000-1111',
        occupation: 'Retired',
        address: '456 Oak Ave, Seattle',
        idUrl: ''
      },
      riskScore: 85,
      aiRecommendation: 'High income relative to rent. Strong employment record. Recommend approval.'
    }
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
