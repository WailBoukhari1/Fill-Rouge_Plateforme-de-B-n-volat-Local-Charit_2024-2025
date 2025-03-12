import { createAction, props } from '@ngrx/store';
import { VolunteerStatistics, VolunteerHours } from '../../core/services/volunteer.service';
import { VolunteerStats, OrganizationStats, AdminStats, DetailedVolunteerStats, StatisticsResponse } from '../../core/models/statistics.model';

// Load Statistics Actions
export const loadStatistics = createAction('[Volunteer] Load Statistics');

export const loadStatisticsSuccess = createAction(
  '[Volunteer] Load Statistics Success',
  props<{ statistics: StatisticsResponse }>()
);

export const loadStatisticsFailure = createAction(
  '[Volunteer] Load Statistics Failure',
  props<{ error: string }>()
);

// Load Detailed Statistics Actions
export const loadDetailedStats = createAction('[Volunteer] Load Detailed Stats');

export const loadDetailedStatsSuccess = createAction(
  '[Volunteer] Load Detailed Stats Success',
  props<{ detailedStats: DetailedVolunteerStats }>()
);

export const loadDetailedStatsFailure = createAction(
  '[Volunteer] Load Detailed Stats Failure',
  props<{ error: string }>()
);

// Load Hours Actions
export const loadHours = createAction('[Volunteer] Load Hours');

export const loadHoursSuccess = createAction(
  '[Volunteer] Load Hours Success',
  props<{ hours: VolunteerHours[] }>()
);

export const loadHoursFailure = createAction(
  '[Volunteer] Load Hours Failure',
  props<{ error: string }>()
); 