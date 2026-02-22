// Common API response types matching backend ApiResponse<T>

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  records: T[];
  has_next: boolean;
  current_page: number;
  total: number;
}

export interface PaginatedParams {
  page?: number;
  limit?: number;
}
