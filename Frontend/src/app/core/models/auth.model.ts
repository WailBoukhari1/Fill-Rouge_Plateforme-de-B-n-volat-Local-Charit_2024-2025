export interface JwtToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  emailVerified: boolean;
  profilePicture?: string;
}

export type UserRole = 'ADMIN' | 'ORGANIZATION' | 'VOLUNTEER';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  token: JwtToken | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface OAuthProvider {
  name: string;
  icon: string;
  color: string;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    name: 'Google',
    icon: 'google',
    color: '#DB4437'
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    color: '#333333'
  }
}; 
