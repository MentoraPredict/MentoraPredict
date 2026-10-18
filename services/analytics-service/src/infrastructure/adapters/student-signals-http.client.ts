import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  EmotionalSignal,
  IStudentSignalsClient,
  LoginActivitySignal,
} from '../../domain/ports/i-student-signals.client';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;

@Injectable()
export class StudentSignalsHttpClient implements IStudentSignalsClient {
  private readonly logger = new Logger(StudentSignalsHttpClient.name);
  private readonly academicUrl: string;
  private readonly authUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.academicUrl = config.get<string>('ACADEMIC_SERVICE_URL', 'http://academic-service:3003');
    this.authUrl = config.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3001');
  }

  getEmotionalState(
    studentId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<EmotionalSignal | null> {
    return this.get<EmotionalSignal | null>(
      `${this.academicUrl}/api/v1/academic/internal/students/${studentId}/subjects/${subjectId}/emotional-state`,
      correlationId,
    );
  }

  getLoginActivity(studentId: string, correlationId?: string): Promise<LoginActivitySignal> {
    return this.get<LoginActivitySignal>(
      `${this.authUrl}/api/v1/auth/internal/users/${studentId}/login-activity`,
      correlationId,
    );
  }

  private async get<T>(url: string, correlationId?: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          'x-correlation-id': correlationId ?? randomUUID(),
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`responded ${res.status}`);

      const text = await res.text();
      return (text ? JSON.parse(text) : null) as T;
    } catch (err) {
      this.logger.warn(`Student signal request failed: ${url} (${err instanceof Error ? err.message : String(err)})`);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}