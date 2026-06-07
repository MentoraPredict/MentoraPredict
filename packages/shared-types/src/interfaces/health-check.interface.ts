import { ServiceStatus } from '../enums/service-status.enum';

export interface HealthCheckResponse {
  status: ServiceStatus;
  services: Record<string, ServiceStatus>;
  timestamp: string;
}
