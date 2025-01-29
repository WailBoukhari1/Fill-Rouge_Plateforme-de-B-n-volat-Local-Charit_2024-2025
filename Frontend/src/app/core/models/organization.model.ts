export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  verified: boolean;
  userId: string;
} 