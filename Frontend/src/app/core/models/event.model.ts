import { EventStatus } from '../../features/events/models/event.model';

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  latitude: number;
  longitude: number;
  requiredSkills: string[];
  volunteersNeeded: number;
  registeredVolunteers: number;
  status: EventStatus;
  organizationId: string;
  organizationName: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRequest {
  title: string;
  description: string;
  dateTime: string;
  location: string;
  latitude: number;
  longitude: number;
  requiredSkills: string[];
  volunteersNeeded: number;
}

export interface EventFilters {
  location?: string;
  skills?: string[];
  radius?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  volunteerId: string;
  status: RegistrationStatus;
  registeredAt: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; 