import { EntityState } from '@ngrx/entity';
import { Event, EventStats, EventFilters } from '../../core/models/event.model';

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
  registeredAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  hoursLogged?: number;
  pointsAwarded?: number;
  feedback?: string;
  rating?: number;
  noShowReason?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  location: string;
  coordinates: number[];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  category: string;
  status: string;
  requiredSkills: string[];
  rating: number;
  numberOfRatings: number;
  impactSummary: string;
  totalVolunteerHours: number;
  isVirtual: boolean;
  virtualMeetingLink: string;
  difficulty: string;
  durationHours: number;
  isRegistered: boolean;
  isWaitlisted: boolean;
  waitlistEnabled: boolean;
  maxWaitlistSize: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  pointsOffered: number;
  minimumRequirements?: string;
  participants: { [userId: string]: EventParticipant };
  autoApproveRegistrations: boolean;
  requireCheckin: boolean;
  checkInCode?: string;
  organizerNotes?: string;
  participationStatus?: ParticipationStatus;
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