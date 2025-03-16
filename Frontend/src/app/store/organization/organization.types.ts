export interface OrganizationState {
  profile: Organization | null;
  statistics: OrganizationStats | null;
  loading: boolean;
  error: string | null;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  description: string;
  missionStatement: string;
  vision?: string;
  website?: string;
  registrationNumber?: string;
  taxId?: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  country: string;
  focusAreas: string[];
  foundedYear?: number;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  averageRating: number;
  impactScore: number;
  totalEventsHosted: number;
}
