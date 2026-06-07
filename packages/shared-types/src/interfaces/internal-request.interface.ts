/** Required headers for service-to-service communication (RNF-038) */
export interface InternalRequestHeaders {
  authorization: string;        // 'Bearer <JWT>'
  'x-correlation-id': string;   // UUID — distributed tracing
  'x-request-id': string;       // UUID — per-request tracking
}
