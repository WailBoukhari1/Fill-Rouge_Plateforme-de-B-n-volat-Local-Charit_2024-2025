export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  status: number;
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
} 