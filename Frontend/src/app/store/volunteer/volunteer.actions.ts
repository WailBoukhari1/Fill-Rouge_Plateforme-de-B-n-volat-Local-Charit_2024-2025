import { createAction, props } from '@ngrx/store';
import { VolunteerStatistics, VolunteerHours } from '../../core/services/volunteer.service';

// Load Statistics Actions
export const loadStatistics = createAction('[Volunteer] Load Statistics');

export const loadStatisticsSuccess = createAction(
  '[Volunteer] Load Statistics Success',
  props<{ statistics: VolunteerStatistics }>()
);

export const loadStatisticsFailure = createAction(
  '[Volunteer] Load Statistics Failure',
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