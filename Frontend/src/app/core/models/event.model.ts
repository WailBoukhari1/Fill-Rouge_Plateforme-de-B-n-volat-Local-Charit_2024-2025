import { EventCategory, IEvent  } from './event.types';

export {
  EventCategory,
  RegistrationStatus,
  IEvent,
  IEventRegistration,
  IEventFeedback,
  IEventStats,
  IEventFilters,
  IEventNotification,
  IEventAchievement,
  EventParticipation,
  EventParticipationStatus
} from './event.types';

export enum EventStatus {
  // DRAFT = 'DRAFT',           // Event is in draft state, not yet submitted for approval
  PENDING = 'PENDING',       // Waiting for admin approval
  ACTIVE = 'ACTIVE',         // Approved and open for registration
  FULL = 'FULL',            // Maximum participants reached
  ONGOING = 'ONGOING',      // Event is currently happening
  COMPLETED = 'COMPLETED',  // Event has ended
  CANCELLED = 'CANCELLED',  // Event has been cancelled
  REJECTED = 'REJECTED'     // Event was rejected by admin
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  location: string;
  coordinates?: number[];
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  registeredParticipants: string[];
  waitlistedParticipants: string[];
  guestParticipantEmails: string[];
  category: EventCategory;
  status: EventStatus;
  averageRating: number;
  numberOfRatings: number;
  createdAt: Date;
  updatedAt: Date;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  waitlistEnabled: boolean;
  maxWaitlistSize: number;
  currentWaitlistSize: number;
  requiredSkills: string[];
  virtual: boolean;
  requiresApproval: boolean;
  difficulty: string;
  tags: string[];
  recurring: boolean;
  minimumAge: number;
  requiresBackground: boolean;
  specialEvent: boolean;
  pointsAwarded: number;
  durationHours: number;
  bannerImage?: string;
}

// Helper functions for event status management
export const EventStatusHelper = {
  canBeApproved: (status: EventStatus): boolean => {
    return status === EventStatus.PENDING || status === EventStatus.REJECTED;
  },

  canBeRejected: (status: EventStatus): boolean => {
    return status === EventStatus.PENDING;
  },

  canBeEdited: (status: EventStatus): boolean => {
    return status === EventStatus.PENDING || status === EventStatus.REJECTED;
  },

  isRegistrationOpen: (status: EventStatus): boolean => {
    return status === EventStatus.ACTIVE;
  },

  isInProgress: (status: EventStatus): boolean => {
    return status === EventStatus.ONGOING;
  },

  isCompleted: (status: EventStatus): boolean => {
    return status === EventStatus.COMPLETED;
  },

  isFull: (status: EventStatus): boolean => {
    return status === EventStatus.FULL;
  },

  isCancelled: (status: EventStatus): boolean => {
    return status === EventStatus.CANCELLED;
  },

  isRejected: (status: EventStatus): boolean => {
    return status === EventStatus.REJECTED;
  },

  isDraft: (status: EventStatus): boolean => {
    return status === EventStatus.PENDING;
  },

  isPending: (status: EventStatus): boolean => {
    return status === EventStatus.PENDING;
  },

  getStatusColor: (status: EventStatus): string => {
    switch (status) {
      case EventStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case EventStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case EventStatus.FULL:
        return 'bg-blue-100 text-blue-800';
      case EventStatus.ONGOING:
        return 'bg-purple-100 text-purple-800';
      case EventStatus.COMPLETED:
        return 'bg-indigo-100 text-indigo-800';
      case EventStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case EventStatus.REJECTED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getStatusLabel: (status: EventStatus): string => {
    switch (status) {
      case EventStatus.PENDING:
        return 'Pending Approval';
      case EventStatus.ACTIVE:
        return 'Active';
      case EventStatus.FULL:
        return 'Full';
      case EventStatus.ONGOING:
        return 'Ongoing';
      case EventStatus.COMPLETED:
        return 'Completed';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      case EventStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }
  
};

