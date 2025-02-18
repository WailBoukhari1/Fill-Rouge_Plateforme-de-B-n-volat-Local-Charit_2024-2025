import {
  IEvent,
  EventStatus,
  EventCategory,
  IEventRegistration,
  RegistrationStatus,
  IEventFeedback,
  IEventStats,
  IEventFilters
} from './event.types';

export type Event = IEvent;
export type EventRegistration = IEventRegistration;
export type EventFeedback = IEventFeedback;
export type EventStats = IEventStats;
export type EventFilters = IEventFilters;

export { EventStatus, EventCategory, RegistrationStatus };

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