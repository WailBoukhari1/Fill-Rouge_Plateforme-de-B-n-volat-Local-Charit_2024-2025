import { createAction, props } from '@ngrx/store';
import { AdminStatistics } from '../../core/models/statistics.model';
import { User, UserRole } from '../../core/models/auth.models';
import { Organization } from '../../core/models/organization.model';

// Statistics actions
export const loadAdminStatistics = createAction(
  '[Admin] Load Statistics'
);

export const loadAdminStatisticsSuccess = createAction(
  '[Admin] Load Statistics Success',
  props<{ statistics: AdminStatistics }>()
);

export const loadAdminStatisticsFailure = createAction(
  '[Admin] Load Statistics Failure',
  props<{ error: string }>()
);

// User actions
export const loadUsers = createAction(
  '[Admin] Load Users',
  props<{ page: number; size: number }>()
);

export const loadUsersSuccess = createAction(
  '[Admin] Load Users Success',
  props<{ users: User[]; totalUsers: number }>()
);

export const loadUsersFailure = createAction(
  '[Admin] Load Users Failure',
  props<{ error: string }>()
);

export const lockUserAccount = createAction(
  '[Admin] Lock User Account',
  props<{ userId: string }>()
);

export const lockUserAccountSuccess = createAction(
  '[Admin] Lock User Account Success',
  props<{ userId: string }>()
);

export const lockUserAccountFailure = createAction(
  '[Admin] Lock User Account Failure',
  props<{ error: string }>()
);

export const unlockUserAccount = createAction(
  '[Admin] Unlock User Account',
  props<{ userId: string }>()
);

export const unlockUserAccountSuccess = createAction(
  '[Admin] Unlock User Account Success',
  props<{ userId: string }>()
);

export const unlockUserAccountFailure = createAction(
  '[Admin] Unlock User Account Failure',
  props<{ error: string }>()
);

export const updateUserRole = createAction(
  '[Admin] Update User Role',
  props<{ userId: string; role: UserRole }>()
);

export const updateUserRoleSuccess = createAction(
  '[Admin] Update User Role Success',
  props<{ userId: string; role: UserRole }>()
);

export const updateUserRoleFailure = createAction(
  '[Admin] Update User Role Failure',
  props<{ error: string }>()
);

export const deleteUser = createAction(
  '[Admin] Delete User',
  props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
  '[Admin] Delete User Success',
  props<{ userId: string }>()
);

export const deleteUserFailure = createAction(
  '[Admin] Delete User Failure',
  props<{ error: string }>()
);

// Organization actions
export const loadOrganizations = createAction(
  '[Admin] Load Organizations',
  props<{ page: number; size: number }>()
);

export const loadOrganizationsSuccess = createAction(
  '[Admin] Load Organizations Success',
  props<{ organizations: Organization[]; totalOrganizations: number }>()
);

export const loadOrganizationsFailure = createAction(
  '[Admin] Load Organizations Failure',
  props<{ error: string }>()
);

export const verifyOrganization = createAction(
  '[Admin] Verify Organization',
  props<{ organizationId: string }>()
);

export const verifyOrganizationSuccess = createAction(
  '[Admin] Verify Organization Success',
  props<{ organizationId: string }>()
);

export const verifyOrganizationFailure = createAction(
  '[Admin] Verify Organization Failure',
  props<{ error: string }>()
);

export const suspendOrganization = createAction(
  '[Admin] Suspend Organization',
  props<{ organizationId: string }>()
);

export const suspendOrganizationSuccess = createAction(
  '[Admin] Suspend Organization Success',
  props<{ organizationId: string }>()
);

export const suspendOrganizationFailure = createAction(
  '[Admin] Suspend Organization Failure',
  props<{ error: string }>()
);

export const reactivateOrganization = createAction(
  '[Admin] Reactivate Organization',
  props<{ organizationId: string }>()
);

export const reactivateOrganizationSuccess = createAction(
  '[Admin] Reactivate Organization Success',
  props<{ organizationId: string }>()
);

export const reactivateOrganizationFailure = createAction(
  '[Admin] Reactivate Organization Failure',
  props<{ error: string }>()
);

export const deleteOrganization = createAction(
  '[Admin] Delete Organization',
  props<{ organizationId: string }>()
);

export const deleteOrganizationSuccess = createAction(
  '[Admin] Delete Organization Success',
  props<{ organizationId: string }>()
);

export const deleteOrganizationFailure = createAction(
  '[Admin] Delete Organization Failure',
  props<{ error: string }>()
); 