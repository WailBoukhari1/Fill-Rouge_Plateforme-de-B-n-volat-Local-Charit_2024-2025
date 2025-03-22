import { createAction, props } from '@ngrx/store';
import { Organization, OrganizationStats } from './organization.types';
import { User } from '../../core/models/auth.models';

export const loadProfile = createAction('[Organization] Load Profile');
export const loadProfileSuccess = createAction(
  '[Organization] Load Profile Success',
  props<{ profile: Organization }>()
);
export const loadProfileFailure = createAction(
  '[Organization] Load Profile Failure',
  props<{ error: string }>()
);

export const loadUserData = createAction(
  '[Organization] Load User Data',
  props<{ userId: string }>()
);
export const loadUserDataSuccess = createAction(
  '[Organization] Load User Data Success',
  props<{ userData: User }>()
);
export const loadUserDataFailure = createAction(
  '[Organization] Load User Data Failure',
  props<{ error: string }>()
);

export const loadStats = createAction('[Organization] Load Statistics');
export const loadStatsSuccess = createAction(
  '[Organization] Load Statistics Success',
  props<{ statistics: OrganizationStats }>()
);
export const loadStatsFailure = createAction(
  '[Organization] Load Statistics Failure',
  props<{ error: string }>()
);

export const updateProfile = createAction(
  '[Organization] Update Profile',
  props<{ profile: Partial<Organization> }>()
);
export const updateProfileSuccess = createAction(
  '[Organization] Update Profile Success',
  props<{ profile: Organization }>()
);
export const updateProfileFailure = createAction(
  '[Organization] Update Profile Failure',
  props<{ error: string }>()
);
