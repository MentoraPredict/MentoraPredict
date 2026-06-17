export interface ApiErrorResponse {
    statusCode?: number;
    message?: string | string[];
    timestamp?: string;
    path?: string;
    requestId?: string;
}
