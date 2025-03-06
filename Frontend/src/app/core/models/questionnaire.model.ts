/**
 * Interface for questionnaire request data
 */
export interface QuestionnaireRequest {
  role: string;
  phoneNumber: string;
  address?: string;
  city: string;
  province: string;

  // Organization specific fields
  organizationName?: string;
  website?: string;
  description?: string;
  organizationType?: string;
  foundedYear?: number;
  missionStatement?: string;
  focusAreas?: string[];
  socialMediaLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };

  // Volunteer specific fields
  bio?: string;
  skills?: string[];
  interests?: string[];
  availability?: string[];
  education?: string;
  experience?: string;
  preferredCauses?: string[];
  languages?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  drivingLicense?: boolean;
  specialNeeds?: string;
  statistics?: {
    experienceYears?: number;
    hoursPerWeek?: number;
    commitmentLength?: string;
    maxTravelDistance?: number;
  };
}

/**
 * Organization types
 */
export enum OrganizationType {
  NONPROFIT = 'NONPROFIT',
  CHARITY = 'CHARITY',
  FOUNDATION = 'FOUNDATION',
  COMMUNITY_GROUP = 'COMMUNITY_GROUP',
  SOCIAL_ENTERPRISE = 'SOCIAL_ENTERPRISE',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATIONAL = 'EDUCATIONAL',
  OTHER = 'OTHER'
}

/**
 * Focus areas for organizations
 */
export enum FocusArea {
  EDUCATION = 'Education',
  HEALTH = 'Health',
  ENVIRONMENT = 'Environment',
  POVERTY = 'Poverty Relief',
  HUMAN_RIGHTS = 'Human Rights',
  ANIMAL_WELFARE = 'Animal Welfare',
  ARTS_CULTURE = 'Arts & Culture',
  DISASTER_RELIEF = 'Disaster Relief',
  COMMUNITY_DEVELOPMENT = 'Community Development',
  YOUTH_DEVELOPMENT = 'Youth Development',
  ELDERLY_CARE = 'Elderly Care',
  DISABILITY_SUPPORT = 'Disability Support',
  REFUGEE_SUPPORT = 'Refugee Support',
  HOMELESSNESS = 'Homelessness',
  FOOD_SECURITY = 'Food Security',
  OTHER = 'Other'
}

/**
 * Languages
 */
export enum Language {
  ARABIC = 'Arabic',
  AMAZIGH = 'Amazigh',
  FRENCH = 'French',
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  PORTUGUESE = 'Portuguese',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  RUSSIAN = 'Russian',
  HINDI = 'Hindi',
  OTHER = 'Other'
}
