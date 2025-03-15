import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.state';

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  requiresTwoFactor: false
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
    requiresTwoFactor: false
  })),

  on(AuthActions.loginSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    accessToken: token,
    refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
    requiresTwoFactor: false
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    requiresTwoFactor: false
  })),

  // Two Factor Required
  on(AuthActions.twoFactorRequired, (state) => ({
    ...state,
    loading: false,
    error: null,
    requiresTwoFactor: true
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    accessToken: token,
    refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Questionnaire
  on(AuthActions.submitQuestionnaire, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.submitQuestionnaireSuccess, (state, { user }) => {
    // Get the role from the user object
    const role = user.role;
    
    const updatedUser = {
      ...state.user,
      ...user,
      role: role,  // Use the role directly
      roles: [role],  // Set roles array with the single role
      questionnaireCompleted: true
    };
    
    // Update localStorage with the complete user data
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    return {
      ...state,
      user: updatedUser,
      loading: false,
      error: null
    };
  }),

  on(AuthActions.submitQuestionnaireFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.logoutSuccess, () => {
    // Clear any remaining localStorage items
    localStorage.clear();
    sessionStorage.clear();
    
    // Return to initial state
    return {
      ...initialState,
      loading: false
    };
  }),

  on(AuthActions.logoutFailure, (state, { error }) => {
    // Even on failure, clear the state but keep the error
    return {
      ...initialState,
      loading: false,
      error
    };
  }),

  // Refresh Token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    accessToken: token,
    refreshToken,
    loading: false,
    error: null
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Stored User
  on(AuthActions.loadStoredUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loadStoredUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: !!user,
    loading: false,
    error: null
  }))
);
