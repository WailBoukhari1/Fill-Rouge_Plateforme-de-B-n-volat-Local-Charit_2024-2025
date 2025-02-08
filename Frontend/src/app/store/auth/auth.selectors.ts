import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state) => state.refreshToken
);

export const selectIsEmailVerified = createSelector(
  selectUser,
  (user) => user?.emailVerified ?? false
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

export const selectUserFullName = createSelector(
  selectUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : null
); 