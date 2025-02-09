import { EventStatus } from './event-status.enum';

// Base interface with common properties
interface BaseEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  organizationId: string;
  organizationName: string;
  requiredSkills: string[];
  registeredParticipants: string[];
  imageUrl?: string;
  status: EventStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  isRegistered: boolean;
  availableSpots: number;
  registeredVolunteers: number;
}

// Event type used in components
export type Event = BaseEvent;

// Request type for creating/updating events
export interface EventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  requiredSkills: string[];
  imageUrl?: string;
  latitude: number;
  longitude: number;
}

// Response type from API
export type EventResponse = BaseEvent;

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