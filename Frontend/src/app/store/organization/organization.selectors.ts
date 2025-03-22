import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationState } from './organization.types';

export const selectOrganizationState =
  createFeatureSelector<OrganizationState>('organization');

export const selectProfile = createSelector(
  selectOrganizationState,
  (state) => state.profile
);

export const selectUserData = createSelector(
  selectOrganizationState,
  (state) => state.userData
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

export const selectOrganizationId = createSelector(
  selectProfile,
  (profile) => profile?.id
);

// Selector to get combined profile and user data
export const selectProfileWithUserData = createSelector(
  selectProfile,
  selectUserData,
  (profile, userData) => {
    if (!profile) return null;
    return {
      organization: profile,
      user: userData
    };
  }
);
