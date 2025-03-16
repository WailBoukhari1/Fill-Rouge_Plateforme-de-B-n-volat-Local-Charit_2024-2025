export interface VolunteerStats {
  totalHoursVolunteered: number;
  eventsParticipated: number;
  upcomingEvents: number;
  completedEvents: number;
  attendanceRate: number;
  averageRating: number;
  impactScore: number;
  skillsAcquired: number;
  certificatesEarned: number;
  organizationsSupported: number;
  recentEvents: RecentEvent[];
}

export interface RecentEvent {
  eventId: string;
  eventName: string;
  date: Date;
  hours: number;
  organizationName: string;
}

export interface OrganizationStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalEvents: number;
  ongoingEvents: number;
  upcomingEvents: number;
  averageEventRating: number;
  totalVolunteerHours: number;
  impactScore: number;
  resourcesShared: number;
}

export interface AdminStats {
  // Platform Overview
  totalUsers: number;
  activeUsers: number;
  totalVolunteers: number;
  totalOrganizations: number;
  totalEvents: number;
  platformEngagementRate: number;
  
  // Organization Metrics
  verifiedOrganizations: number;
  pendingVerifications: number;
  
  // Activity Metrics
  activeEvents: number;
  completedEvents: number;
  canceledEvents: number;
  totalVolunteerHours: number;
  totalResources: number;
  averageVolunteerHoursPerEvent: number;
  
  // Growth Metrics
  userGrowth: TimeSeriesData[];
  eventGrowth: TimeSeriesData[];
  eventsByCategory: { [key: string]: number };
  
  // Engagement Metrics
  averageVolunteersPerEvent: number;
  volunteerRetentionRate: number;
  volunteersByLocation: { [key: string]: number };
}

export interface DetailedVolunteerStats {
  totalVolunteerHours: number;
  eventsAttended: number;
  upcomingEvents: number;
  reliabilityScore: number;
  averageRating: number;
  impactScore: number;
  achievements: string[];
  recentActivities: {
    eventId: string;
    eventName: string;
    date: Date;
    hoursContributed: number;
  }[];
}

export interface StatisticsResponse {
  userId: string;
  userRole: string;
  adminStats?: AdminStats;
  organizationStats?: OrganizationStats;
  volunteerStats?: VolunteerStats;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
} 