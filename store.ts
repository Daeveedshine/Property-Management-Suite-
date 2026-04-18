
import { User, Property, Agreement, Payment, MaintenanceTicket, Notification, UserRole, PropertyStatus, TicketStatus, TicketPriority, NotificationType, TenantApplication, ApplicationStatus, PropertyCategory, FormTemplate, Transaction } from './types';
import { db, isConfigured } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'prop_lifecycle_data';
const FIRESTORE_COLLECTION = 'app_data';
const FIRESTORE_DOC_ID = 'global_store';

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
  transactions: Transaction[];
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

const initialData: AppState = {
  users: [],
  properties: [],
  agreements: [],
  payments: [],
  tickets: [],
  notifications: [],
  applications: [
    {
      id: 'mock_app_1',
      userId: 'tenant_1',
      propertyId: 'p1',
      agentId: 'agent_1',
      status: ApplicationStatus.PENDING,
      submissionDate: new Date().toISOString(),
      firstName: 'John',
      surname: 'Doe',
      middleName: 'Michael',
      dob: '1990-01-01',
      maritalStatus: 'Single',
      gender: 'Male',
      currentHomeAddress: '123 Fake Street, Lagos',
      occupation: 'Software Engineer',
      familySize: 1,
      phoneNumber: '08012345678',
      reasonForRelocating: 'Work',
      currentLandlordName: 'Mr. Smith',
      currentLandlordPhone: '08098765432',
      verificationType: 'National ID',
      verificationIdNumber: '123456789',
      agentIdCode: 'A101',
      signature: 'JD',
      applicationDate: new Date().toISOString(),
      riskScore: 85,
      aiRecommendation: 'Highly recommended due to stable income.'
    }
  ],
  formTemplates: [],
  transactions: [],
  currentUser: null,
  theme: 'dark',
  settings: initialSettings,
};

// Retrieve data synchronously from LocalStorage for instant UI render
export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialData;
  const parsed = JSON.parse(saved);
  
  // Migration: Convert legacy assignedPropertyId to assignedPropertyIds array
  if (parsed.users) {
    parsed.users = parsed.users.map((u: any) => {
      if (u.assignedPropertyId && !u.assignedPropertyIds) {
        u.assignedPropertyIds = [u.assignedPropertyId];
      }
      if (u.role === UserRole.AGENT && u.walletBalance === undefined) {
        u.walletBalance = 5000; // Give every agent ₦5000 starter balance for this prototype
      }
      return u;
    });
  }
  if (parsed.currentUser) {
    if (parsed.currentUser.assignedPropertyId && !parsed.currentUser.assignedPropertyIds) {
      parsed.currentUser.assignedPropertyIds = [parsed.currentUser.assignedPropertyId];
    }
    if (parsed.currentUser.role === UserRole.AGENT && parsed.currentUser.walletBalance === undefined) {
      parsed.currentUser.walletBalance = 5000;
    }
  }

  if (!parsed.transactions) parsed.transactions = [];

  if (!parsed.settings) parsed.settings = initialSettings;
  if (!parsed.formTemplates) parsed.formTemplates = initialData.formTemplates;
  return parsed;
};

// Save data to LocalStorage (Immediate) AND Firestore (Async)
export const saveStore = (state: AppState) => {
  // 1. Local Persistence (Fast)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // 2. Remote Persistence (Firebase)
  if (isConfigured && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      // We overwrite the entire state document. In a production app, you would update sub-collections.
      // We exclude currentUser from the cloud sync to keep auth session local/separate in this prototype.
      const cloudState = { ...state, currentUser: null }; 
      setDoc(docRef, cloudState, { merge: true }).catch((err: any) => 
        console.error("Firestore Save Error:", err)
      );
    } catch (e) {
      console.error("Firebase connection failed", e);
    }
  }
};

// Subscribe to Firestore updates (Real-time Sync)
export const initFirebaseSync = (onUpdate: (newState: AppState) => void) => {
  if (!isConfigured || !db) return () => {};

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as AppState;
        
        // Merge remote data with local session (currentUser)
        const currentLocal = getStore();
        const updatedCurrentUser = currentLocal.currentUser 
          ? remoteData.users.find(u => u.id === currentLocal.currentUser?.id) || currentLocal.currentUser 
          : null;

        const mergedState = {
          ...remoteData,
          currentUser: updatedCurrentUser, // Keep local session with latest data
          theme: currentLocal.theme // Keep local theme preference
        };

        // Update LocalStorage to match Cloud
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState));
        
        // Notify App
        onUpdate(mergedState);
      }
    }, (error: any) => {
        console.error("Firestore Sync Error:", error);
    });
    return unsubscribe;
  } catch (e) {
    console.error("Error initializing Firebase listener", e);
    return () => {};
  }
};

/**
 * UTILITY: Format currency based on user settings
 */
export const formatCurrency = (amount: number, settings: UserSettings): string => {
  const rates = { NGN: 1, USD: 0.00065, EUR: 0.0006 };
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
