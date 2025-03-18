import { createReducer, on } from '@ngrx/store';
import { OrganizationState, initialState } from './organization.state';
import * as OrganizationActions from './organization.actions';

export const organizationReducer = createReducer(
  initialState,
  on(OrganizationActions.loadOrganizationProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrganizationActions.loadOrganizationProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null
  })),
  on(OrganizationActions.loadOrganizationProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrganizationActions.updateOrganizationProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrganizationActions.updateOrganizationProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null
  })),
  on(OrganizationActions.updateOrganizationProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrganizationActions.updateProfilePicture, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrganizationActions.updateProfilePictureSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null
  })),
  on(OrganizationActions.updateProfilePictureFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrganizationActions.clearOrganizationProfile, () => initialState),
  on(OrganizationActions.deleteOrganization, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrganizationActions.deleteOrganizationSuccess, () => initialState),
  on(OrganizationActions.deleteOrganizationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 