import { AuthUser, JwtToken, UserRole } from '../auth.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  id: string;
  email: string;
  roles: UserRole[];
  emailVerified: boolean;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
  timestamp: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: JwtToken;
}

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  emailVerified: boolean;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
} 