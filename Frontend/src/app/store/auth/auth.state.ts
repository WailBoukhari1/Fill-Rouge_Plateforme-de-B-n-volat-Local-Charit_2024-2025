import { User } from '../../core/models/auth.models';

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  requiresTwoFactor: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  error: null,
  loading: false,
  requiresTwoFactor: false
}; 