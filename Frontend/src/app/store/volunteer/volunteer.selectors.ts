import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VolunteerState } from './volunteer.state';

export const selectVolunteerState = createFeatureSelector<VolunteerState>('volunteer');

export const selectProfile = createSelector(
  selectVolunteerState,
  (state) => state.profile
);

export const selectStatistics = createSelector(
  selectVolunteerState,
  (state) => state.statistics
);

export const selectLoading = createSelector(
  selectVolunteerState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectVolunteerState,
  (state) => state.error
); 