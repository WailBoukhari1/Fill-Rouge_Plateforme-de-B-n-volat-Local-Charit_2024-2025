import { Organization, OrganizationStats } from './organization.model';
import { VolunteerProfile } from '../services/volunteer.service';

export type UserRole = 'VOLUNTEER' | 'ORGANIZATION';
export type ProfileType = VolunteerProfile | Organization;

export interface BaseStats {
  averageRating: number;
  impactScore: number;
}

export interface VolunteerStats extends BaseStats {
  totalEventsParticipated: number;
  activeEvents: number;
  completedEvents: number;
  totalHours: number;
  skillsEndorsed: number;
}

export { OrganizationStats } from './organization.model';

export type StatsType = VolunteerStats | OrganizationStats;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
