import { UserRole } from './auth.models';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  roles?: string[];
  questionnaireCompleted?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  accountLocked?: boolean;
  accountExpired?: boolean;
  credentialsExpired?: boolean;
  profilePicture?: string;
  lastLoginIp?: string;
  lastLoginAt?: string;
} 