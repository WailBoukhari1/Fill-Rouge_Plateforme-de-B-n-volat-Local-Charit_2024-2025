import { VolunteerHours } from '../../core/services/volunteer.service';
import { DetailedVolunteerStats, StatisticsResponse } from '../../core/models/statistics.model';

export interface VolunteerState {
  statistics: StatisticsResponse | null;
  detailedStats: DetailedVolunteerStats | null;
  hours: VolunteerHours[];
  loading: boolean;
  error: string | null;
}

export const initialVolunteerState: VolunteerState = {
  statistics: null,
  detailedStats: null,
  hours: [],
  loading: false,
  error: null
}; 