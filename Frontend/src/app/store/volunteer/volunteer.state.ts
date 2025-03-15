import { VolunteerStats } from '../../core/models/statistics.model';

export interface VolunteerState {
  statistics: VolunteerStats | null;
  loading: boolean;
  error: string | null;
}

export const initialState: VolunteerState = {
  statistics: null,
  loading: false,
  error: null
}; 