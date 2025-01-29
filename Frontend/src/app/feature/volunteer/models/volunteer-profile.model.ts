export interface VolunteerProfile {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  location: string;
  phoneNumber: string;
  interests: string[];
  availability: string;
  rating?: number;
  totalHours?: number;
} 