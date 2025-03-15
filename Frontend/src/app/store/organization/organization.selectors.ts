import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationState } from './organization.types';

export const selectOrganizationState =
  createFeatureSelector<OrganizationState>('organization');

export const selectProfile = createSelector(
  selectOrganizationState,
  (state) => state.profile
);

export const selectStatistics = createSelector(
  selectOrganizationState,
  (state) => state.statistics
);

export const selectLoading = createSelector(
  selectOrganizationState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectOrganizationState,
  (state) => state.error
);
