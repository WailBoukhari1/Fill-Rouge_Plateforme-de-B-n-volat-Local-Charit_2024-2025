/**
 * Interface for questionnaire request data
 */
export interface QuestionnaireRequest {
  role: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
  country: string;
  
  // Organization specific fields
  type?: string;
  name?: string;
  description?: string;
  missionStatement?: string;
  vision?: string;
  website?: string;
  registrationNumber?: string;
  taxId?: string;
  focusAreas?: string[];
  foundedYear?: number | null;
  socialMediaLinks?: SocialMediaLinksDTO;
  
  // Volunteer specific fields
  bio?: string;
  education?: string;
  experience?: string;
  specialNeeds?: string;
  skills?: string[];
  interests?: string[];
  availableDays?: string[];
  preferredTimeOfDay?: string;
  languages?: string[];
  certifications?: string[];
  availableForEmergency?: boolean;
  emergencyContact?: EmergencyContactDTO;
}

export interface SocialMediaLinksDTO {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface EmergencyContactDTO {
  name: string;
  relationship?: string;
  phone: string;
}

/**
 * Organization types
 */
export enum OrganizationType {
  NGO = 'NGO',
  CHARITY = 'CHARITY',
  FOUNDATION = 'FOUNDATION',
  SOCIAL_ENTERPRISE = 'SOCIAL_ENTERPRISE',
  COMMUNITY_GROUP = 'COMMUNITY_GROUP',
  OTHER = 'OTHER'
}

/**
 * Focus areas for organizations
 */
export enum FocusArea {
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  ENVIRONMENT = 'ENVIRONMENT',
  POVERTY = 'POVERTY',
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  ANIMAL_WELFARE = 'ANIMAL_WELFARE',
  ARTS_CULTURE = 'ARTS_CULTURE',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  YOUTH_DEVELOPMENT = 'YOUTH_DEVELOPMENT',
  ELDERLY_CARE = 'ELDERLY_CARE',
  DISABILITY_SUPPORT = 'DISABILITY_SUPPORT',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  YOUTH_DEVELOPMENT = 'YOUTH_DEVELOPMENT',
  ELDERLY_CARE = 'ELDERLY_CARE',
  DISABILITY_SUPPORT = 'DISABILITY_SUPPORT',
  OTHER = 'OTHER'
}

/**
 * Languages
 */
export enum Language {
  ARABIC = 'ARABIC',
  FRENCH = 'FRENCH',
  ENGLISH = 'ENGLISH',
  SPANISH = 'SPANISH',
  GERMAN = 'GERMAN',
  CHINESE = 'CHINESE',
  JAPANESE = 'JAPANESE',
  JAPANESE = 'JAPANESE',
  OTHER = 'OTHER'
}
