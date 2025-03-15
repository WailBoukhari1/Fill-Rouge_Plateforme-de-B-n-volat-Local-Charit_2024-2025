import { createReducer, on } from '@ngrx/store';
import { OrganizationState } from './organization.types';
import * as OrganizationActions from './organization.actions';

export const initialState: OrganizationState = {
  profile: null,
  statistics: null,
  loading: false,
  error: null,
};

export const organizationReducer = createReducer(
  initialState,

  // Load Profile
  on(OrganizationActions.loadProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrganizationActions.loadProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
  })),
  on(OrganizationActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Load Statistics
  on(OrganizationActions.loadStats, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrganizationActions.loadStatsSuccess, (state, { statistics }) => ({
    ...state,
    statistics,
    loading: false,
  })),
  on(OrganizationActions.loadStatsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Update Profile
  on(OrganizationActions.updateProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrganizationActions.updateProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
  })),
  on(OrganizationActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
