export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION',
  UNASSIGNED = 'UNASSIGNED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roles: string[];
  phoneNumber?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountLocked: boolean;
  accountExpired: boolean;
  credentialsExpired: boolean;
  profilePicture?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  questionnaireCompleted?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
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
  success?: boolean;
  data: T;
  message?: string;
  status?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  roles?: string[];
  token: string;
  refreshToken: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  accountLocked?: boolean;
  accountExpired?: boolean;
  credentialsExpired?: boolean;
  profilePicture?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
  questionnaireCompleted?: boolean;
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
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
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
