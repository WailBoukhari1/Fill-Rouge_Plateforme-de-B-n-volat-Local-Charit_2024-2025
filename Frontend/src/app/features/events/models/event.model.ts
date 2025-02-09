export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  requiredSkills: string[];
  volunteersNeeded: number;
  registeredVolunteers: number;
  organizationId: string;
  organizationName: string;
  status: EventStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  isRegistered: boolean;
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface EventFilters {
  location?: string;
  skills?: string[];
  radius?: number;
} 