
import { User, Property, Agreement, Payment, MaintenanceTicket, Notification, UserRole, PropertyStatus, TicketStatus, TicketPriority, NotificationType, TenantApplication, ApplicationStatus, PropertyCategory, FormTemplate } from './types';

const STORAGE_KEY = 'prop_lifecycle_data';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
    payments: boolean;
  };
  appearance: {
    density: 'comfortable' | 'compact';
    animations: boolean;
    glassEffect: boolean;
  };
  localization: {
    currency: 'NGN' | 'USD' | 'EUR';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  };
}

interface AppState {
  users: User[];
  properties: Property[];
  agreements: Agreement[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  notifications: Notification[];
  applications: TenantApplication[];
  formTemplates: FormTemplate[];
  currentUser: User | null;
  theme: 'light' | 'dark';
  settings: UserSettings;
}

const initialSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    maintenance: true,
    payments: true
  },
  appearance: {
    density: 'comfortable',
    animations: true,
    glassEffect: true
  },
  localization: {
    currency: 'NGN',
    dateFormat: 'DD/MM/YYYY'
  }
};

const DEFAULT_TEMPLATE: FormTemplate = {
  agentId: 'u1',
  lastUpdated: new Date().toISOString(),
  sections: [
    {
      id: 's1',
      title: 'Identity Credentials',
      icon: 'User',
      fields: [
        { id: 'f1', key: 'surname', label: 'Surname', type: 'text', required: true },
        { id: 'f2', key: 'firstName', label: 'First Name', type: 'text', required: true },
        { id: 'f3', key: 'middleName', label: 'Other Names', type: 'text', required: false },
        { id: 'f4', key: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { id: 'f5', key: 'gender', label: 'Biological Gender', type: 'select', options: ['Male', 'Female'], required: true },
        { id: 'f6', key: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widow', 'Widower', 'Separated'], required: true }
      ]
    },
    {
      id: 's2',
      title: 'Professional & Contact',
      icon: 'Briefcase',
      fields: [
        { id: 'f7', key: 'occupation', label: 'Current Occupation', type: 'text', required: true },
        { id: 'f8', key: 'familySize', label: 'Family Size', type: 'number', required: true },
        { id: 'f9', key: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true }
      ]
    },
    {
      id: 's3',
      title: 'Residential History',
      icon: 'MapPin',
      fields: [
        { id: 'f10', key: 'currentHomeAddress', label: 'Current House Address', type: 'textarea', required: true },
        { id: 'f11', key: 'reasonForRelocating', label: 'Reason for Relocation', type: 'textarea', required: true },
        { id: 'f12', key: 'currentLandlordName', label: 'Name of Current Landlord', type: 'text', required: true },
        { id: 'f13', key: 'currentLandlordPhone', label: 'Landlord Phone Number', type: 'tel', required: true }
      ]
    },
    {
      id: 's4',
      title: 'Identity Verification',
      icon: 'ShieldCheck',
      fields: [
        { id: 'f14', key: 'verificationType', label: 'Select ID Type', type: 'select', options: ['NIN', "Voter's Card", 'Passport', 'Drivers License'], required: true },
        { id: 'f15', key: 'verificationIdNumber', label: 'ID Number', type: 'text', required: true },
        { id: 'f16', key: 'verificationUrl', label: 'Photo of Valid ID', type: 'file', required: true },
        { id: 'f17', key: 'passportPhotoUrl', label: 'Passport Photo', type: 'file', required: true }
      ]
    },
    {
      id: 's5',
      title: 'Final Authorization',
      icon: 'PenTool',
      fields: [
        { id: 'f18', key: 'signature', label: 'Digital Signature (Full Legal Name)', type: 'text', required: true },
        { id: 'f19', key: 'applicationDate', label: 'Application Date', type: 'date', required: true }
      ]
    }
  ]
};

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
  formTemplates: [DEFAULT_TEMPLATE],
  currentUser: null,
  theme: 'dark',
  settings: initialSettings,
};

export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialData;
  const parsed = JSON.parse(saved);
  if (!parsed.settings) parsed.settings = initialSettings;
  if (!parsed.formTemplates) parsed.formTemplates = initialData.formTemplates;
  return parsed;
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

/**
 * UTILITY: Format currency based on user settings
 */
export const formatCurrency = (amount: number, settings: UserSettings): string => {
  const rates = { NGN: 1, USD: 0.00065, EUR: 0.0006 }; // Simulated exchange rates from Base NGN
  const converted = amount * rates[settings.localization.currency];
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.localization.currency,
    minimumFractionDigits: settings.localization.currency === 'NGN' ? 0 : 2
  }).format(converted);
};

/**
 * UTILITY: Format date based on user settings
 */
export const formatDate = (dateString: string, settings: UserSettings): string => {
  if (!dateString || dateString === '---') return '---';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return settings.localization.dateFormat === 'DD/MM/YYYY' 
    ? `${day}/${month}/${year}` 
    : `${month}/${day}/${year}`;
};
