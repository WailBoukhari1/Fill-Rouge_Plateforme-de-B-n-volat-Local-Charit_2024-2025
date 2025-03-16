import { createAction, props } from '@ngrx/store';
import { DetailedVolunteerStats, VolunteerHours } from '../../core/models/statistics.models';
import { StatisticsResponse } from '../../core/models/statistics.model';
import { VolunteerProfile, VolunteerStatistics } from '../../core/services/volunteer.service';

// Load Statistics
export const loadStatistics = createAction('[Volunteer] Load Statistics');

export const loadStatisticsSuccess = createAction(
  '[Volunteer] Load Statistics Success',
  props<{ statistics: VolunteerStatistics }>()
);

export const loadStatisticsFailure = createAction(
  '[Volunteer] Load Statistics Failure',
  props<{ error: string }>()
);

// Load Detailed Statistics Actions
export const loadDetailedStats = createAction(
  '[Volunteer] Load Detailed Stats',
  props<{ userId: string }>()
);

export const loadDetailedStatsSuccess = createAction(
  '[Volunteer] Load Detailed Stats Success',
  props<{ detailedStats: DetailedVolunteerStats }>()
);

export const loadDetailedStatsFailure = createAction(
  '[Volunteer] Load Detailed Stats Failure',
  props<{ error: any }>()
);

// Load Hours Actions
export const loadVolunteerHours = createAction(
  '[Volunteer] Load Volunteer Hours',
  props<{ userId: string }>()
);

export const loadVolunteerHoursSuccess = createAction(
  '[Volunteer] Load Volunteer Hours Success',
  props<{ hours: VolunteerHours[] }>()
);

export const loadVolunteerHoursFailure = createAction(
  '[Volunteer] Load Volunteer Hours Failure',
  props<{ error: any }>()
);

export const loadProfile = createAction('[Volunteer] Load Profile');
export const loadProfileSuccess = createAction(
  '[Volunteer] Load Profile Success',
  props<{ profile: VolunteerProfile }>()
);
export const loadProfileFailure = createAction(
  '[Volunteer] Load Profile Failure',
  props<{ error: string }>()
); 