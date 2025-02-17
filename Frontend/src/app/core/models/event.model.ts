export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum EventCategory {
  ENVIRONMENT = 'ENVIRONMENT',
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  COMMUNITY = 'COMMUNITY',
  ARTS = 'ARTS',
  SPORTS = 'SPORTS',
  TECHNOLOGY = 'TECHNOLOGY',
  SOCIAL = 'SOCIAL'
}

export interface Event {
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
}

export interface EventLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export enum EventType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID'
}

export interface EventRegistration {
  eventId: string;
  volunteerId: string;
  registrationDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  checkedIn: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursContributed?: number;
  feedbackSubmitted: boolean;
  approvalDate?: Date;
  rejectionReason?: string;
  waitlistPosition?: number;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  volunteerId: string;
  rating: number;
  comment: string;
  hoursContributed: number;
  submittedAt: Date;
  isAnonymous: boolean;
}

export interface EventStats {
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

export interface EventFilters {
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
} 