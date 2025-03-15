import { createReducer, on } from '@ngrx/store';
import * as VolunteerActions from './volunteer.actions';
import { initialState } from './volunteer.state';

export const volunteerReducer = createReducer(
  initialState,
  
  // Load Statistics
  on(VolunteerActions.loadStatistics, state => ({
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

  // Detailed Statistics
  on(VolunteerActions.loadDetailedStats, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(VolunteerActions.loadDetailedStatsSuccess, (state, { detailedStats }) => ({
    ...state,
    detailedStats,
    loading: false,
    error: null
  })),

  on(VolunteerActions.loadDetailedStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Hours
  on(VolunteerActions.loadHours, state => ({
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