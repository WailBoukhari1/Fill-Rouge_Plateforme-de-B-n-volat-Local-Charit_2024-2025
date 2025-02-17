export interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: any;
  createdAt: Date;
  createdBy: string;
  status: ReportStatus;
  filters?: ReportFilter[];
}

export enum ReportType {
  VOLUNTEER_ACTIVITY = 'VOLUNTEER_ACTIVITY',
  EVENT_PARTICIPATION = 'EVENT_PARTICIPATION',
  ORGANIZATION_PERFORMANCE = 'ORGANIZATION_PERFORMANCE',
  SKILL_DISTRIBUTION = 'SKILL_DISTRIBUTION',
  CERTIFICATION_STATUS = 'CERTIFICATION_STATUS',
  ACHIEVEMENT_PROGRESS = 'ACHIEVEMENT_PROGRESS'
}

export enum ReportStatus {
  GENERATED = 'GENERATED',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
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