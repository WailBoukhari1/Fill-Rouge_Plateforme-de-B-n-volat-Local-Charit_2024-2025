export interface IVolunteer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  skills: string[];
  joinedDate: Date;
  status: VolunteerStatus;
  totalHours: number;
  completedEvents: number;
  rating?: number;
  bio?: string;
  profileImage?: string;
}

export interface IVolunteerActivity {
  eventId: string;
  eventTitle: string;
  date: Date;
  hours: number;
  status: VolunteerActivityStatus;
  feedback?: string;
  rating?: number;
}

export enum VolunteerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED'
}

export enum VolunteerActivityStatus {
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface IVolunteerFilters {
  status?: VolunteerStatus;
  skills?: string[];
  searchTerm?: string;
  sortBy?: 'name' | 'joinedDate' | 'totalHours' | 'rating';
  sortOrder?: 'asc' | 'desc';
} 