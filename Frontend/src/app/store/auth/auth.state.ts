import { User } from '../../core/models/auth.models';

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  requiresTwoFactor: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  requiresTwoFactor: false,
};
