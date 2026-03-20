// common API response format - all backend responses will follow this structure

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

// when we get paginated data from the backend (like a list of questions)
export interface PagedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
