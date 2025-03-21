import { VolunteerStatus } from './volunteer.types';

export interface IOrganizationVolunteer {
  id: string;
  organizationId: string;
  volunteerId: string;
  status: VolunteerStatus;
  joinedDate: Date;
  role: VolunteerRole;
  skills: string[];
  totalHours: number;
  completedEvents: number;
  upcomingEvents: number;
  rating?: number;
  lastActive?: Date;
  notes?: string;
}

export enum VolunteerRole {
  REGULAR = 'REGULAR',
  TEAM_LEAD = 'TEAM_LEAD',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

export interface IVolunteerAssignment {
  id: string;
  eventId: string;
  eventTitle: string;
  role: VolunteerRole;
  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  assignedAt: Date;
  hours?: number;
  feedback?: string;
  rating?: number;
}

export interface IVolunteerStats {
  totalEvents: number;
  totalHours: number;
  averageRating: number;
  completionRate: number;
  reliabilityScore: number;
  skillsUtilization: Record<string, number>;
  impactMetrics: {
    peopleHelped: number;
    projectsCompleted: number;
    communitiesServed: number;
  };
} 