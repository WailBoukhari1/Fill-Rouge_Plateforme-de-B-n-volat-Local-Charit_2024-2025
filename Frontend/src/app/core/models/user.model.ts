export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION'
} 