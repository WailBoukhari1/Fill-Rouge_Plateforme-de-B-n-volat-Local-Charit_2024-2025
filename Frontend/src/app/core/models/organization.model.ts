export interface Organization {
  id: string;
  name: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  logo?: string;
  coverImage?: string;
  address: Address;
  type: OrganizationType;
  category: OrganizationCategory;
  status: OrganizationStatus;
  verificationStatus: VerificationStatus;
  foundedYear?: number;
  size: OrganizationSize;
  mission?: string;
  vision?: string;
  taxId?: string;
  registrationNumber?: string;
  documents: OrganizationDocument[];
  stats: OrganizationStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export enum OrganizationType {
  NONPROFIT = 'NONPROFIT',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATIONAL = 'EDUCATIONAL',
  RELIGIOUS = 'RELIGIOUS',
  COMMUNITY = 'COMMUNITY',
  OTHER = 'OTHER'
}

export enum OrganizationCategory {
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  ENVIRONMENT = 'ENVIRONMENT',
  ARTS = 'ARTS',
  SOCIAL_SERVICES = 'SOCIAL_SERVICES',
  YOUTH = 'YOUTH',
  ELDERLY = 'ELDERLY',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  OTHER = 'OTHER'
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum OrganizationSize {
  SMALL = 'SMALL', // < 10 employees
  MEDIUM = 'MEDIUM', // 10-50 employees
  LARGE = 'LARGE', // 50-200 employees
  ENTERPRISE = 'ENTERPRISE' // > 200 employees
}

export interface OrganizationDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  status: DocumentStatus;
}

export enum DocumentType {
  REGISTRATION = 'REGISTRATION',
  TAX = 'TAX',
  FINANCIAL = 'FINANCIAL',
  ANNUAL_REPORT = 'ANNUAL_REPORT',
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalHours: number;
  averageRating: number;
  impactMetrics?: {
    peopleServed?: number;
    fundsRaised?: number;
    projectsCompleted?: number;
  };
} 