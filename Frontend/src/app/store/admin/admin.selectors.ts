import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState, organizationsAdapter, usersAdapter } from './admin.reducer';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

// Statistics selectors
export const selectAdminStatistics = createSelector(
  selectAdminState,
  (state) => state.statistics
);

// User selectors
export const selectUserState = createSelector(
  selectAdminState,
  (state) => state.users
);

export const {
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectAllUsers,
  selectTotal: selectTotalUsers
} = usersAdapter.getSelectors(selectUserState);

export const selectSelectedUserId = createSelector(
  selectAdminState,
  (state) => state.selectedUserId
);

export const selectSelectedUser = createSelector(
  selectUserEntities,
  selectSelectedUserId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Organization selectors
export const selectOrganizationState = createSelector(
  selectAdminState,
  (state) => state.organizations
);

export const {
  selectIds: selectOrganizationIds,
  selectEntities: selectOrganizationEntities,
  selectAll: selectAllOrganizations,
  selectTotal: selectTotalOrganizations
} = organizationsAdapter.getSelectors(selectOrganizationState);

export const selectSelectedOrganizationId = createSelector(
  selectAdminState,
  (state) => state.selectedOrganizationId
);

export const selectSelectedOrganization = createSelector(
  selectOrganizationEntities,
  selectSelectedOrganizationId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Additional selectors for counts
export const selectTotalOrganizationsCount = createSelector(
  selectAdminState,
  (state) => state.totalOrganizations
);

export const selectTotalUsersCount = createSelector(
  selectAdminState,
  (state) => state.totalUsers
);

// Loading and error selectors
export const selectAdminLoading = createSelector(
  selectAdminState,
  (state) => state.loading
);

export const selectAdminError = createSelector(
  selectAdminState,
  (state) => state.error
); 