export interface User {
  id: string;
  email: string;
  roles: string[];
  emailVerified: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION'
} 