import {
  IEvent,
  IEventRegistration,
  RegistrationStatus,
  IEventFeedback,
  IEventStats,
  EventStatus,
  EventCategory
} from './event.types';

export type Event = IEvent;
export type EventRegistration = IEventRegistration;
export type EventFeedback = IEventFeedback;
export type EventStats = IEventStats;
export type EventFilters = IEventFilters;

export { RegistrationStatus, EventStatus, EventCategory };

export interface EventLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface EventParticipant {
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  registrationDate: Date;
  checkedIn: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursContributed?: number;
  feedbackSubmitted: boolean;
  approvalDate?: Date;
  rejectionReason?: string;
  waitlistPosition?: number;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizationName: string;
  participantCount: number;
  maxParticipants: number;
  requiredSkills: string[];
  status: string;
  isRegistered: boolean;
  isWaitlisted: boolean;
  waitlistPosition?: number;
}

export enum EventType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID'
}

export interface EventRequest {
  title: string;
  description: string;
  location: string;
  coordinates: [number, number];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  category: EventCategory;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  location: string;
  coordinates: [number, number];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  category: EventCategory;
  status: EventStatus;
  averageRating: number;
  numberOfRatings: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IEventFilters {
  organizationId?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  category?: EventCategory;
  status?: EventStatus;
  startDate?: Date;
  endDate?: Date;
}