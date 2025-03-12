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
  // Platform overview
  totalUsers: number;
  activeUsers: number;
  platformEngagementRate: number;
  
  // Organization metrics
  totalOrganizations: number;
  verifiedOrganizations: number;
  pendingVerifications: number;
  
  // Event metrics
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  canceledEvents: number;
  
  // Resource metrics
  totalResources: number;
  resourcesByCategory: { [key: string]: number };
  
  // Growth metrics
  userGrowthRate: number;
  eventGrowthRate: number;
  monthlyActiveUsers: number[];
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
  volunteerStats?: VolunteerStats;
  organizationStats?: OrganizationStats;
  adminStats?: AdminStats;
} 