import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VolunteerState } from './volunteer.state';

export const selectVolunteerState = createFeatureSelector<VolunteerState>('volunteer');

export const selectVolunteerStatistics = createSelector(
  selectVolunteerState,
  state => state.statistics
);

export const selectVolunteerLoading = createSelector(
  selectVolunteerState,
  state => state.loading
);

export const selectVolunteerError = createSelector(
  selectVolunteerState,
  state => state.error
); 