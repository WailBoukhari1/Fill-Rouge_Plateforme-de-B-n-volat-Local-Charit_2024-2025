import { createReducer, on } from '@ngrx/store';
import * as VolunteerActions from './volunteer.actions';
import { initialState } from './volunteer.state';
import { VolunteerProfile, VolunteerStatistics } from '../../core/services/volunteer.service';

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
  on(VolunteerActions.loadVolunteerHours, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(VolunteerActions.loadVolunteerHoursSuccess, (state, { hours }) => ({
    ...state,
    hours,
    loading: false,
    error: null
  })),

  on(VolunteerActions.loadVolunteerHoursFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Profile
  on(VolunteerActions.loadProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(VolunteerActions.loadProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false
  })),

  on(VolunteerActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
); 