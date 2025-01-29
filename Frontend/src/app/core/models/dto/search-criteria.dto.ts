export interface SearchCriteria {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  filters?: { [key: string]: any };
} 