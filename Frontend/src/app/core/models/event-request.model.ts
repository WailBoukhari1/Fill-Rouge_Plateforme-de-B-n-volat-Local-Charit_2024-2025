import { EventCategory, EventStatus } from './event.types';

export interface EventRequest {
  userId: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  category: EventCategory;
  status?: EventStatus;
  
  // Optional fields that are commonly used
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  waitlistEnabled?: boolean;
  maxWaitlistSize?: number;
  requiredSkills?: string[];
  isVirtual?: boolean;
  requiresApproval?: boolean;
  difficulty?: string;
  tags?: string[];
  minimumAge?: number;
  requiresBackground?: boolean;
  isSpecialEvent?: boolean;
  pointsAwarded?: number;
  durationHours?: number;
  coordinates?: [number, number];
  registeredParticipants?: string[];
  waitlistedParticipants?: string[];
} 