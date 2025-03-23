import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Organization, OrganizationStatus, VerificationStatus } from '../../core/models/organization.model';
import { User } from '../../core/models/auth.models';

import * as AdminActions from './admin.actions';
import { AdminStatistics } from '../../core/models/statistics.model';

export interface AdminState {
  organizations: EntityState<Organization>;
  users: EntityState<User>;
  loading: boolean;
  error: string | null;
  totalOrganizations: number;
  totalUsers: number;
  statistics: AdminStatistics | null;
  selectedUserId: string | null;
  selectedOrganizationId: string | null;
}

export const organizationsAdapter: EntityAdapter<Organization> = createEntityAdapter<Organization>();
export const usersAdapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialState: AdminState = {
  organizations: organizationsAdapter.getInitialState(),
  users: usersAdapter.getInitialState(),
  loading: false,
  error: null,
  totalOrganizations: 0,
  totalUsers: 0,
  statistics: null,
  selectedUserId: null,
  selectedOrganizationId: null
};

export const adminReducer = createReducer(
  initialState,

  // Statistics
  on(AdminActions.loadAdminStatistics, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadAdminStatisticsSuccess, (state, { statistics }) => ({
    ...state,
    loading: false,
    statistics
  })),
  on(AdminActions.loadAdminStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Users
  on(AdminActions.loadUsers, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadUsersSuccess, (state, { users, totalUsers }) => ({
    ...state,
    users: usersAdapter.setAll(users, state.users),
    totalUsers,
    loading: false
  })),
  on(AdminActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Lock User
  on(AdminActions.lockUserAccountSuccess, (state, { userId }) => {
    const user = state.users.entities[userId];
    if (!user) return state;
    
    return {
      ...state,
      users: usersAdapter.updateOne({
        id: userId,
        changes: { accountLocked: true }
      }, state.users)
    };
  }),

  // Unlock User
  on(AdminActions.unlockUserAccountSuccess, (state, { userId }) => {
    const user = state.users.entities[userId];
    if (!user) return state;
    
    return {
      ...state,
      users: usersAdapter.updateOne({
        id: userId,
        changes: { accountLocked: false }
      }, state.users)
    };
  }),

  // Update User Role
  on(AdminActions.updateUserRoleSuccess, (state, { userId, role }) => {
    const user = state.users.entities[userId];
    if (!user) return state;
    
    return {
      ...state,
      users: usersAdapter.updateOne({
        id: userId,
        changes: { role }
      }, state.users)
    };
  }),

  // Delete User
  on(AdminActions.deleteUserSuccess, (state, { userId }) => ({
    ...state,
    users: usersAdapter.removeOne(userId, state.users),
    totalUsers: state.totalUsers - 1
  })),

  // Organizations
  on(AdminActions.loadOrganizations, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AdminActions.loadOrganizationsSuccess, (state, { organizations, totalOrganizations }) => ({
    ...state,
    organizations: organizationsAdapter.setAll(organizations, state.organizations),
    totalOrganizations,
    loading: false
  })),
  on(AdminActions.loadOrganizationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Verify Organization
  on(AdminActions.verifyOrganizationSuccess, (state, { organizationId, organization }) => {
    return {
      ...state,
      organizations: organizationsAdapter.updateOne({
        id: organizationId,
        changes: organization
      }, state.organizations)
    };
  }),
  
  // Suspend Organization
  on(AdminActions.suspendOrganizationSuccess, (state, { organizationId, organization }) => {
    return {
      ...state,
      organizations: organizationsAdapter.updateOne({
        id: organizationId,
        changes: organization
      }, state.organizations)
    };
  }),
  
  // Reactivate Organization
  on(AdminActions.reactivateOrganizationSuccess, (state, { organizationId, organization }) => {
    return {
      ...state,
      organizations: organizationsAdapter.updateOne({
        id: organizationId,
        changes: organization
      }, state.organizations)
    };
  }),
  
  // Delete Organization
  on(AdminActions.deleteOrganizationSuccess, (state, { organizationId }) => ({
    ...state,
    organizations: organizationsAdapter.removeOne(organizationId, state.organizations),
    totalOrganizations: state.totalOrganizations - 1
  }))
); 