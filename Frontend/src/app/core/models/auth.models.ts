export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountLocked: boolean;
  accountExpired: boolean;
  credentialsExpired: boolean;
  profilePicture?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
  tokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  sessionId?: string;
  requiresTwoFactor?: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  authorities?: string[];
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountLocked: boolean;
  accountExpired: boolean;
  credentialsExpired: boolean;
  profilePicture?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  organizationName?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
}

export interface EmailVerificationRequest {
  email: string;
  code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface NewPasswordRequest {
  code: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  secretKey: string;
  qrCodeUrl: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}
