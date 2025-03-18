import { createAction, props } from '@ngrx/store';
import { OrganizationProfile } from '../../models/organization.model';

export const loadOrganizationProfile = createAction(
  '[Organization] Load Profile'
);

export const loadOrganizationProfileSuccess = createAction(
  '[Organization] Load Profile Success',
  props<{ profile: OrganizationProfile }>()
);

export const loadOrganizationProfileFailure = createAction(
  '[Organization] Load Profile Failure',
  props<{ error: string }>()
);

export const updateOrganizationProfile = createAction(
  '[Organization] Update Profile',
  props<{ profile: Partial<OrganizationProfile> }>()
);

export const updateOrganizationProfileSuccess = createAction(
  '[Organization] Update Profile Success',
  props<{ profile: OrganizationProfile }>()
);

export const updateOrganizationProfileFailure = createAction(
  '[Organization] Update Profile Failure',
  props<{ error: string }>()
);

export const updateProfilePicture = createAction(
  '[Organization] Update Profile Picture',
  props<{ file: File }>()
);

export const updateProfilePictureSuccess = createAction(
  '[Organization] Update Profile Picture Success',
  props<{ profile: OrganizationProfile }>()
);

export const updateProfilePictureFailure = createAction(
  '[Organization] Update Profile Picture Failure',
  props<{ error: string }>()
);

export const clearOrganizationProfile = createAction(
  '[Organization] Clear Profile'
);

export const deleteOrganization = createAction(
  '[Organization] Delete Organization',
  props<{ id: string }>()
);

export const deleteOrganizationSuccess = createAction(
  '[Organization] Delete Organization Success'
);

export const deleteOrganizationFailure = createAction(
  '[Organization] Delete Organization Failure',
  props<{ error: string }>()
); 