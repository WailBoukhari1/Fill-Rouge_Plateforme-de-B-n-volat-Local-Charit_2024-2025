import { VolunteerStatistics, VolunteerHours } from '../../core/services/volunteer.service';

export interface VolunteerState {
  statistics: VolunteerStatistics | null;
  hours: VolunteerHours[];
  loading: boolean;
  error: string | null;
}

export const initialVolunteerState: VolunteerState = {
  statistics: null,
  hours: [],
  loading: false,
  error: null
}; 