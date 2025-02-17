export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  endorsements: SkillEndorsement[];
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LANGUAGE = 'LANGUAGE',
  MANAGEMENT = 'MANAGEMENT',
  MEDICAL = 'MEDICAL',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface SkillEndorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  relationship: string;
  comment?: string;
  createdAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  status: CertificationStatus;
  skills: string[];
  documents: CertificationDocument[];
}

export enum CertificationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  PENDING = 'PENDING'
}

export interface CertificationDocument {
  id: string;
  type: string;
  url: string;
  verified: boolean;
} 