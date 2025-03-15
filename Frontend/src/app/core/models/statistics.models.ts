export interface AdminStats {
  platformEngagementRate: number;
  verifiedOrganizations: number;
  totalResources: number;
  totalUsers: number;
  totalEvents: number;
  totalVolunteers: number;
  totalOrganizations: number;
  averageEventRating: number;
  totalVolunteerHours: number;
}

export interface VolunteerStats {
  userId: string;
  userRole: string;
  totalEventsAttended: number;
  totalHoursVolunteered: number;
  averageRating: number;
  reliabilityScore: number;
  skillEndorsements: number;
  impactScore: number;
}

export interface DetailedVolunteerStats extends VolunteerStats {
  eventsByCategory: { [key: string]: number };
  monthlyHours: { [key: string]: number };
  skillProgress: { [key: string]: number };
  achievements: string[];
}

export interface VolunteerHours {
  date: string;
  hours: number;
  eventId: string;
  eventName: string;
}

export interface StatisticsResponse {
  userId: string;
  userRole: string;
  stats: AdminStats | VolunteerStats;
} 