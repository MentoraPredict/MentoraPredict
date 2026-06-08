export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  timestamp: string;
}
