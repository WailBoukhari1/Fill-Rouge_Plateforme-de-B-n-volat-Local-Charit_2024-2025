import { VolunteerProfile, VolunteerStatistics } from '../../core/services/volunteer.service';

export interface VolunteerState {
  profile: VolunteerProfile | null;
  statistics: VolunteerStatistics | null;
  loading: boolean;
  error: string | null;
}

export const initialState: VolunteerState = {
  profile: null,
  statistics: null,
  loading: false,
  error: null
}; 