import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState, UserRole } from '../../core/models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuth = (state: { auth: AuthState }) => state.auth;

export const selectAuthUser = createSelector(
  selectAuth,
  (state: AuthState) => state.user
);

export const selectToken = createSelector(
  selectAuth,
  (state: AuthState) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuth,
  (state: AuthState) => state.isAuthenticated
);

export const selectAuthLoading = createSelector(
  selectAuth,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(
  selectAuth,
  (state: AuthState) => state.error
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state) => state.token?.refreshToken
);

export const selectUserRoles = createSelector(
  selectAuthUser,
  (user) => user?.roles || []
);

export const selectHasRole = (role: UserRole) => createSelector(
  selectUserRoles,
  (roles) => roles.includes(role)
);

export const selectIsEmailVerified = createSelector(
  selectAuthUser,
  (user) => user?.emailVerified || false
);

export const selectUserRole = createSelector(
  selectAuthUser,
  (user) => user?.roles[0]
);

export const selectUserFullName = createSelector(
  selectAuthUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : null
); 