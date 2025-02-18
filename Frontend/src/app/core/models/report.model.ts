export enum ReportType {
  USER = 'USER',
  EVENT = 'EVENT',
  ORGANIZATION = 'ORGANIZATION',
  VOLUNTEER = 'VOLUNTEER'
}

export interface OverviewStatistics {
  totalUsers: number;
  userGrowthRate: number;
  activeOrganizations: number;
  organizationGrowthRate: number;
  totalEvents: number;
  eventGrowthRate: number;
  totalVolunteerHours: number;
  volunteerHoursGrowthRate: number;
}

export interface UserActivity {
  userName: string;
  action: string;
  timestamp: Date;
}

export interface EventStatistics {
  eventName: string;
  participantCount: number;
  totalHours: number;
  averageRating: number;
}

export interface ReportRequest {
  type: ReportType;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportResponse {
  fileUrl: string;
  fileName: string;
  generatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: any;
  createdAt: Date;
  createdBy: string;
  status: ReportStatus;
  filters?: ReportFilter[];
  downloadUrl?: string;
}

export enum ReportStatus {
  GENERATED = 'GENERATED',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  BETWEEN = 'BETWEEN'
} 