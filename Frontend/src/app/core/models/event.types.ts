export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PUBLISHED = 'PUBLISHED',
  UPCOMING = 'UPCOMING'
}

export enum EventCategory {
  OTHER = 'OTHER',
  ENVIRONMENT = 'ENVIRONMENT',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  ARTS_AND_CULTURE = 'ARTS_AND_CULTURE',
  EDUCATION = 'EDUCATION',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  SPORTS_AND_RECREATION = 'SPORTS_AND_RECREATION',
  HEALTH = 'HEALTH',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  SOCIAL_SERVICES = 'SOCIAL_SERVICES'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED'
}

export interface IEvent {
  _id?: string;
  organizationId: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  coordinates: [number, number];
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  waitlistEnabled: boolean;
  maxWaitlistSize: number;
  requiredSkills: string[];
  isVirtual: boolean;
  requiresApproval: boolean;
  difficulty: string;
  tags: string[];
  isRecurring: boolean;
  minimumAge: number;
  requiresBackground: boolean;
  isSpecialEvent: boolean;
  pointsAwarded: number;
  durationHours: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: EventStatus;
  averageRating: number;
  numberOfRatings: number;
  registeredParticipants: string[];
  waitlistedParticipants: string[];
  participations: any[];
  bannerImage?: string;
  _class?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface IEventFeedback {
  eventId: string;
  volunteerId: string;
  rating: number;
  feedback: string;
  submittedAt: Date;
}

export interface IEventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  totalParticipants: number;
  totalVolunteerHours: number;
  averageRating: number;
  participationRate: number;
  completionRate: number;
  categoryDistribution: { [key: string]: number };
  monthlyParticipation: { [key: string]: number };
  monthlyHours: { [key: string]: number };
}

export interface IEventFilters {
  organizationId?: string;
  category?: EventCategory;
  status?: EventStatus;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  radius?: number;
  searchQuery?: string;
  minParticipants?: number;
  maxParticipants?: number;
  requiresApproval?: boolean;
  isVirtual?: boolean;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface IEventNotification {
  id: string;
  eventId: string;
  type: 'REGISTRATION' | 'APPROVAL' | 'REJECTION' | 'REMINDER' | 'CANCELLATION' | 'UPDATE';
  message: string;
  createdAt: Date;
  read: boolean;
  recipientId: string;
  recipientType: 'VOLUNTEER' | 'ORGANIZATION' | 'ADMIN';
  metadata?: any;
}

export interface IEventAchievement {
  id: string;
  eventId: string;
  volunteerId: string;
  type: string;
  name: string;
  description: string;
  earnedAt: Date;
  points: number;
  metadata?: any;
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: EventParticipationStatus;
  registeredAt: Date;
  attendedAt?: Date;
  feedback?: string;
  rating?: number;
}

export enum EventParticipationStatus {
  REGISTERED = 'REGISTERED',
  WAITLISTED = 'WAITLISTED',
  ATTENDED = 'ATTENDED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
} 