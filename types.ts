
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  TENANT = 'TENANT'
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  LISTED = 'LISTED',
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
  ARCHIVED = 'ARCHIVED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedPropertyId?: string;
  phone?: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  rent: number;
  status: PropertyStatus;
  agentId: string;
  tenantId?: string;
  description?: string;
}

export interface Agreement {
  id: string;
  propertyId: string;
  tenantId: string;
  version: number;
  startDate: string;
  endDate: string;
  documentUrl?: string;
  status: 'active' | 'expired' | 'terminated';
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'late';
}

export interface MaintenanceTicket {
  id: string;
  tenantId: string;
  propertyId: string;
  issue: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  aiAssessment?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkTo?: string; // Optional view to navigate to
}
