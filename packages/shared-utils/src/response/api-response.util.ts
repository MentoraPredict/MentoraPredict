import { ApiResponse, ErrorResponse } from '@mentorapredict/shared-types';

export function buildApiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function buildErrorResponse(
  statusCode: number,
  message: string,
  path: string,
  requestId?: string,
): ErrorResponse {
  return {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path,
    requestId,
  };
}
