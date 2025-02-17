export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  criteria: AchievementCriteria[];
  points: number;
  badge: {
    imageUrl: string;
    level: AchievementLevel;
  };
  progress: number;
  unlockedAt?: Date;
  category: AchievementCategory;
}

export enum AchievementType {
  PARTICIPATION = 'PARTICIPATION',
  SKILL_MASTERY = 'SKILL_MASTERY',
  CERTIFICATION = 'CERTIFICATION',
  LEADERSHIP = 'LEADERSHIP',
  IMPACT = 'IMPACT',
  MILESTONE = 'MILESTONE'
}

export enum AchievementLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum AchievementCategory {
  EVENTS = 'EVENTS',
  SKILLS = 'SKILLS',
  COMMUNITY = 'COMMUNITY',
  EDUCATION = 'EDUCATION',
  SPECIAL = 'SPECIAL'
}

export interface AchievementCriteria {
  id: string;
  description: string;
  type: CriteriaType;
  target: number;
  current: number;
  completed: boolean;
}

export enum CriteriaType {
  EVENT_PARTICIPATION = 'EVENT_PARTICIPATION',
  HOURS_VOLUNTEERED = 'HOURS_VOLUNTEERED',
  SKILLS_ACQUIRED = 'SKILLS_ACQUIRED',
  CERTIFICATIONS_EARNED = 'CERTIFICATIONS_EARNED',
  ENDORSEMENTS_RECEIVED = 'ENDORSEMENTS_RECEIVED'
} 