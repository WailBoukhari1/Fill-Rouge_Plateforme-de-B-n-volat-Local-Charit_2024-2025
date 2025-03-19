export enum EventStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  PUBLISHED = 'PUBLISHED'
}

export enum EventCategory {
  ENVIRONMENT = 'ENVIRONMENT',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  SOCIAL_SERVICES = 'SOCIAL_SERVICES',
  ARTS_AND_CULTURE = 'ARTS_AND_CULTURE',
  SPORTS_AND_RECREATION = 'SPORTS_AND_RECREATION',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  OTHER = 'OTHER'
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  organizationName?: string;
  location: string;
  coordinates?: [number, number];
  startDate: Date;
  endDate: Date;
  date?: Date;
  maxParticipants: number;
  participantCount?: number;
  registeredParticipants: Set<string>;
  category: EventCategory;
  status: EventStatus;
  requiredSkills: string[];
  waitlistEnabled: boolean;
  maxWaitlistSize: number;
  waitlistedParticipants: Set<string>;
  totalVolunteerHours: number;
  averageRating: number;
  numberOfRatings: number;
  impactSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  isCancelled: boolean;
  cancellationReason?: string;
  cancellationDate?: Date;
  cancelledBy?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  requiresApproval: boolean;
  approvedParticipants: Set<string>;
  rejectedParticipants: Set<string>;
  pendingParticipants: Set<string>;
  minimumAge: number;
  requiresBackground: boolean;
  tags: Set<string>;
  virtualMeetingLink?: string;
  isVirtual: boolean;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationHours: number;
  isSpecialEvent: boolean;
  pointsAwarded: number;
  resources: Set<string>;
  sponsors: Set<string>;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: string;
  imageUrl?: string;
  registrationDeadline?: Date;
  isRegistered?: boolean;
  isWaitlisted?: boolean;
  waitlistPosition?: number;
}

export interface IEventRegistration {
  eventId: string;
  volunteerId: string;
  status: RegistrationStatus;
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

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED'
}

export interface IEventFeedback {
  id: string;
  eventId: string;
  volunteerId: string;
  rating: number;
  comment: string;
  improvementAreas: string[];
  highlights: string[];
  wouldVolunteerAgain: boolean;
  createdAt: Date;
}

export interface IEventStats {
  totalEvents: number;
  activeEvents: number;
  totalParticipants: number;
  averageRating: number;
  totalVolunteerHours: number;
  completedEvents: number;
  upcomingEvents: number;
  participationRate: number;
  impactMetrics?: {
    totalHoursContributed: number;
    averageHoursPerEvent: number;
    totalBeneficiaries: number;
    communityImpactScore: number;
  };
}

export interface IEventFilters {
  search?: string;
  category?: EventCategory;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  radius?: number;
  skills?: string[];
  status?: EventStatus;
  organizationId?: string;
  tags?: string[];
  requiresBackground?: boolean;
  isRecurring?: boolean;
  minimumAge?: number;
  isVirtual?: boolean;
  difficulty?: string;
  page?: number;
  size?: number;
} 