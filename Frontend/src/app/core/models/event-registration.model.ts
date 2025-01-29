export interface EventRegistration {
  id: string;
  eventId: string;
  volunteerId: string;
  registrationDate: string;
  status: RegistrationStatus;
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
} 