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
  logoUrl?: string;
  location?: string;
  eventCount?: number;
  rating?: number;
  reviewCount?: number;
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
  NON_PROFIT = 'NON_PROFIT',
  CHARITY = 'CHARITY',
  FOUNDATION = 'FOUNDATION',
  COMMUNITY_GROUP = 'COMMUNITY_GROUP',
  EDUCATIONAL = 'EDUCATIONAL',
  RELIGIOUS = 'RELIGIOUS',
  OTHER = 'OTHER'
}

export enum OrganizationCategory {
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  ARTS_CULTURE = 'ARTS_CULTURE',
  CHILDREN_YOUTH = 'CHILDREN_YOUTH',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  EDUCATION = 'EDUCATION',
  ENVIRONMENT = 'ENVIRONMENT',
  HEALTH = 'HEALTH',
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  POVERTY = 'POVERTY',
  SOCIAL_SERVICES = 'SOCIAL_SERVICES',
  SPORTS_RECREATION = 'SPORTS_RECREATION',
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
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  VERY_LARGE = 'VERY_LARGE'
}

export interface OrganizationDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
}

export enum DocumentType {
  REGISTRATION = 'REGISTRATION',
  TAX_EXEMPTION = 'TAX_EXEMPTION',
  ANNUAL_REPORT = 'ANNUAL_REPORT',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  OTHER = 'OTHER'
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

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface OrganizationProfileDTO {
  name: string;
  description: string;
  mission: string;
  vision: string;
  website?: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  registrationNumber: string;
  type: OrganizationType;
  category: OrganizationCategory;
  size: OrganizationSize;
  foundedYear?: number;
  socialMediaLinks?: SocialMediaLinks;
  focusAreas: string[];
  profilePicture?: string;
}

export interface OrganizationProfile {
  id: string;
  userId: string;
  name: string;
  description: string;
  mission: string;
  vision: string;
  website?: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  coordinates: [number, number];
  focusAreas: string[];
  socialMediaLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  verified: boolean;
  registrationNumber?: string;
  documents: string[];
  rating: number;
  numberOfRatings: number;
  totalEventsHosted: number;
  activeVolunteers: number;
  totalVolunteerHours: number;
  impactScore: number;
  acceptingVolunteers: boolean;
  createdAt: string;
  updatedAt: string;
  type?: OrganizationType;
  category?: OrganizationCategory;
  size?: OrganizationSize;
  foundedYear?: number;
  logo?: string;
  profilePicture?: string;
  imageId?: string;
}

export interface OrganizationRequest {
  name: string;
  description: string;
  mission: string;
  vision: string;
  website?: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  registrationNumber?: string;
  type: OrganizationType;
  category: OrganizationCategory;
  size: OrganizationSize;
  foundedYear?: number;
  coordinates: number[];
  socialMediaLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  focusAreas: string[];
  profilePicture?: string;
  logo?: string;
}

export interface OrganizationResponse extends OrganizationProfile {} 