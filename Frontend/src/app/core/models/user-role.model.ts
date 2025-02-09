export enum UserRole {
  ADMIN = 'ADMIN',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION'
}

export type UserRoleType = keyof typeof UserRole; 