import { createReducer, on } from '@ngrx/store';
import { initialVolunteerState } from './volunteer.state';
import * as VolunteerActions from './volunteer.actions';

export const volunteerReducer = createReducer(
  initialVolunteerState,
  
  // Load Statistics
  on(VolunteerActions.loadStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VolunteerActions.loadStatisticsSuccess, (state, { statistics }) => ({
    ...state,
    statistics,
    loading: false,
    error: null
  })),
  
  on(VolunteerActions.loadStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load Hours
  on(VolunteerActions.loadHours, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(VolunteerActions.loadHoursSuccess, (state, { hours }) => ({
    ...state,
    hours,
    loading: false,
    error: null
  })),
  
  on(VolunteerActions.loadHoursFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 