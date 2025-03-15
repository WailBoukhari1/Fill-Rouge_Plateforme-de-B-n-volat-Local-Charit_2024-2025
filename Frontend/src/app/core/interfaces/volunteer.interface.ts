export interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio: string;
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  totalEventsAttended: number;
  totalVolunteerHours: number;
  averageEventRating: number;
  completionPercentage: number;
  skills: string[];
  interests: string[];
  preferredCauses: string[];
  upcomingEvents: string[];
  pastEvents: string[];
  achievements: string[];
  city: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredCategories: string[];
  maxHoursPerWeek: number;
  preferredRadius: number;
  availableDays: string[];
  preferredTimeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
  certifications: string[];
  languages: string[];
  backgroundChecked: boolean;
  backgroundCheckStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  references: string[];
  reliabilityScore: number;
  impactScore: number;
  availableForEmergency: boolean;
  receiveNotifications: boolean;
  notificationPreferences: string[];
  profileVisible: boolean;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface VolunteerStatistics {
  totalEventsAttended: number;
  totalVolunteerHours: number;
  averageEventRating: number;
  completionPercentage: number;
  reliabilityScore: number;
  impactScore: number;
}

export interface VolunteerPreferences {
  preferredCategories: string[];
  maxHoursPerWeek: number;
  preferredRadius: number;
  availableDays: string[];
  preferredTimeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
  availableForEmergency: boolean;
  receiveNotifications: boolean;
  notificationPreferences: string[];
  profileVisible: boolean;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
}

export interface VolunteerSkills {
  skills: string[];
  interests: string[];
  preferredCauses: string[];
  certifications: string[];
  languages: string[];
}
