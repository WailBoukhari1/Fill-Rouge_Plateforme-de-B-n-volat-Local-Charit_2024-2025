import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from '../../core/models/auth.model';

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,

  // Initialize
  on(AuthActions.initializeAuth, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600
    },
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.registerSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600
    },
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // OAuth
  on(AuthActions.oAuthLogin, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.oAuthSuccess, (state, { user, accessToken, refreshToken }) => ({
    ...state,
    user,
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600
    },
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.oAuthFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Token Refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    loading: false,
    error: null
  })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Email Verification
  on(AuthActions.verifyEmail, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.verifyEmailSuccess, (state) => ({
    ...state,
    user: state.user ? { ...state.user, emailVerified: true } : null,
    loading: false,
    error: null
  })),
  on(AuthActions.verifyEmailFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Password Reset
  on(AuthActions.forgotPassword, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.forgotPasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.resetPassword, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),
  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Session Management
  on(AuthActions.logout, () => ({
    ...initialState
  })),
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null
  }))
); 