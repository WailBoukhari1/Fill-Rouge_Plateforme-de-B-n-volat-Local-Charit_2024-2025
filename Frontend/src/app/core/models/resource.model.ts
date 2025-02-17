export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  fileSize?: number;
  mimeType?: string;
  tags: string[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  status: ResourceStatus;
  accessLevel: ResourceAccessLevel;
  metadata?: Record<string, any>;
}

export enum ResourceType {
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  LINK = 'LINK',
  OTHER = 'OTHER'
}

export enum ResourceStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export enum ResourceAccessLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED'
}

export interface ResourceUploadResponse {
  id: string;
  url: string;
  status: 'success' | 'error';
  message?: string;
} 