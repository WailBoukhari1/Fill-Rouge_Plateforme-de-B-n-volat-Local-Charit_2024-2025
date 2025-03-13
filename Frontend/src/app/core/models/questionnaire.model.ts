/**
 * Interface for questionnaire request data
 */
export interface QuestionnaireRequest {
  role: string;
  contact: {
    phoneNumber: string;
    address: string;
    province: string;
    city: string;
  };
  organizationDetails?: {
    type: string;
    foundedYear?: number;
    website?: string;
    missionStatement: string;
    focusAreas: string[];
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  volunteerDetails?: {
    bio: string;
    education?: string;
    experience?: string;
    specialNeeds?: string;
    skills: string[];
    interests: string[];
    languages: string[];
    emergencyContact: {
      name: string;
      relationship?: string;
      phone: string;
    };
  };
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
  ARTS_CULTURE = 'ARTS_CULTURE',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  YOUTH = 'YOUTH',
  ELDERLY = 'ELDERLY',
  DISABILITY = 'DISABILITY',
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
  OTHER = 'OTHER'
}
