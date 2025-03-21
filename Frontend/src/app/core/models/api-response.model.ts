export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  timestamp?: string;
  status?: number;
  error?: string;
} 