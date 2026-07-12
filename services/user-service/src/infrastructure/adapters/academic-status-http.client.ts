import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeactivationEligibility,
  IAcademicStatusClient,
} from '../../application/ports/output/i-academic-status.client';
import { InternalJwtService } from '../auth/internal-jwt.service';

@Injectable()
export class AcademicStatusHttpClient implements IAcademicStatusClient {
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>(
      'ACADEMIC_SERVICE_URL',
      'http://academic-service:3003',
    );
  }

  async getDeactivationEligibility(
    userId: string,
    role: string,
  ): Promise<DeactivationEligibility> {
    const params = new URLSearchParams({ role });
    const url = `${this.baseUrl}/api/v1/academic/internal/users/${userId}/deactivation-eligibility?${params}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`academic-service responded ${response.status}`);
      }

      return (await response.json()) as DeactivationEligibility;
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo verificar si el usuario tiene dependencias académicas activas.',
      );
    }
  }
}
