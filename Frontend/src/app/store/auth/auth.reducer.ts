import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Login actions
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    token,
    refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Logout actions
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Questionnaire actions
  on(AuthActions.submitQuestionnaire, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.submitQuestionnaireSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),

  on(AuthActions.submitQuestionnaireFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Two Factor Required
  on(AuthActions.twoFactorRequired, (state) => ({
    ...state,
    loading: false,
    error: null,
    requiresTwoFactor: true,
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.registerSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    token,
    refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Refresh Token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    AuthActions.refreshTokenSuccess,
    (state, { user, token, refreshToken }) => ({
      ...state,
      user,
      token,
      refreshToken,
      loading: false,
      error: null,
    })
  ),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Stored User
  on(AuthActions.loadStoredUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loadStoredUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: !!user,
    loading: false,
    error: null,
  }))
);
