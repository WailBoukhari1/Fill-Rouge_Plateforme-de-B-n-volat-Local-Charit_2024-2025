import { OrganizationProfile } from '../../core/models/organization.model';
import { User } from '../../core/models/auth.models';

export interface OrganizationState {
  profile: Organization | null;
  statistics: OrganizationStats | null;
  loading: boolean;
  error: string | null;
  userData: User | null;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string;
  missionStatement: string;
  vision: string;
  website?: string;
  registrationNumber?: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  coordinates?: [number, number];
  focusAreas: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  verified?: boolean;
  documents?: string[];
  rating?: number;
  numberOfRatings?: number;
  totalEventsHosted?: number;
  activeVolunteers?: number;
  totalVolunteerHours?: number;
  impactScore?: number;
  acceptingVolunteers?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  size?: string;
  foundedYear?: number;
  logo?: string;
  profilePicture?: string;
  imageId?: string;
}

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  averageRating: number;
  averageEventRating?: number;
  impactScore: number;
  totalEventsHosted: number;
  eventSuccessRate?: number;
  volunteerRetentionRate?: number;
  volunteerTrends?: Array<{
    date: string;
    value: number;
  }>;
  eventsByCategory?: Record<string, number>;
  recentActivity?: Array<{
    id: string;
    icon: string;
    description: string;
    timestamp: Date;
  }>;
}

export const initialState: OrganizationState = {
  profile: null,
  statistics: null,
  loading: false,
  error: null,
  userData: null
};
