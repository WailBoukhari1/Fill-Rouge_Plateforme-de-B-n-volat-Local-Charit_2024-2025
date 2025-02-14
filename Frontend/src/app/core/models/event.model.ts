import { EventStatus } from './event-status.enum';

export { EventStatus };

// Base interface with common properties
export interface BaseEvent {
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
  requiresApproval: boolean;
  currentParticipants: number;
}

// Event type used in components
export interface Event extends BaseEvent {
  registrationDeadline?: string;
  category?: string;
  distance?: number;
  registrationCount?: number;
  isFull?: boolean;
  organizationLogo?: string;
  statusText?: string;
}

// Request type for creating/updating events
export interface EventRequest {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  category: string;
  imageUrl?: string;
  requiresApproval?: boolean;
  registrationDeadline?: Date;
  status?: EventStatus;
  requiredSkills?: string[];
  latitude?: number;
  longitude?: number;
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

export interface EventSearchParams {
  query?: string;
  categories?: string[];
  location?: string;
  radius?: number;
  includeFullEvents?: boolean;
  includePastEvents?: boolean;
  page?: number;
  size?: number;
}

export interface RoleSpecificEventSearchParams extends EventSearchParams {
  // Admin-specific parameters
  status?: EventStatus[];
  organizationId?: string;
  pendingApproval?: boolean;

  // Organization-specific parameters
  isDraft?: boolean;
  isOwner?: boolean;
  hasRegistrations?: boolean;

  // Volunteer-specific parameters
  isRegistered?: boolean;
  skillMatch?: boolean;
  availableSpots?: boolean;
  registrationOpen?: boolean;
} 