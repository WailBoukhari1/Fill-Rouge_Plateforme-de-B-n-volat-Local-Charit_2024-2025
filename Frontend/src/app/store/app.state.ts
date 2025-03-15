import { AuthState } from './auth/auth.state';

export interface AppState {
  auth: AuthState;
}

export const initialAppState: AppState = {
  auth: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    requiresTwoFactor: false,
  },
};
