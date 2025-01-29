export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  requiredSkills: string[];
  volunteersNeeded: number;
  organizationId: string;
  status: EventStatus;
  latitude: number;
  longitude: number;
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
} 