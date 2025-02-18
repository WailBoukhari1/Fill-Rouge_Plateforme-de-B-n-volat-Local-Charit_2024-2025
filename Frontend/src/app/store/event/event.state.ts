import { EntityState } from '@ngrx/entity';
import { Event, EventStats, EventFilters, EventStatus, EventCategory } from '../../core/models/event.model';

export enum ParticipationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED'
}

export interface EventParticipant {
  userId: string;
  status: ParticipationStatus;
  registeredAt: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  hoursLogged?: number;
  pointsAwarded?: number;
  feedback?: string;
  rating?: number;
  noShowReason?: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;
  organizationDescription?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  coordinates?: [number, number];
  imageUrl: string;
  registeredParticipants: Set<string>;
  maxParticipants: number;
  waitlistedParticipants: Set<string>;
  requiredSkills: string[];
  impactSummary?: string;
  minimumAge: number;
  requiresBackground: boolean;
  waitlistEnabled: boolean;
  maxWaitlistSize: number;
  isCancelled: boolean;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  requiresApproval: boolean;
  approvedParticipants: Set<string>;
  rejectedParticipants: Set<string>;
  pendingParticipants: Set<string>;
  averageRating: number;
  numberOfRatings: number;
  tags: Set<string>;
  participants: { [userId: string]: EventParticipant };
}

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  eventStats: EventStats | null;
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
  };
}

export interface EventFilter {
  category?: string;
  status?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  skills?: string[];
  isVirtual?: boolean;
}

export const initialEventState: EventState = {
  events: [],
  selectedEvent: null,
  eventStats: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalItems: 0
  }
}; 