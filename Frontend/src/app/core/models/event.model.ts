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

export interface IEventScheduleItem {
  time: string;
  activity: string;
}

export interface IEventFeedback {
  rating: number;
  comment: string;
  userId: string;
  createdAt: Date;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  status: EventStatus;
  maxParticipants: number;
  currentParticipants: number;
  requiredSkills: string[];
  schedule: IEventScheduleItem[];
  isRegistered?: boolean;
  feedback?: IEventFeedback;
  isVirtual: boolean;
  requiresApproval: boolean;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventRegistration {
  eventId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  registrationDate: Date;
  checkedIn?: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursContributed?: number;
  feedbackSubmitted?: boolean;
  approvalDate?: Date;
  rejectionReason?: string;
  waitlistPosition?: number;
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

export interface IEventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  registeredEvents: number;
  totalParticipants: number;
  totalHoursContributed: number;
  averageRating: number;
}

export interface IEventNotification {
  id: string;
  eventId: string;
  userId: string;
  type: 'REMINDER' | 'UPDATE' | 'CANCELLATION' | 'REGISTRATION' | 'FEEDBACK';
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface IEventAchievement {
  id: string;
  eventId: string;
  userId: string;
  type: 'PARTICIPATION' | 'HOURS' | 'LEADERSHIP' | 'FEEDBACK';
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
}

export type Event = IEvent;