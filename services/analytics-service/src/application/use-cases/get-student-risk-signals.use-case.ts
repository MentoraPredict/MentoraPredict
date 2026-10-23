import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import {
  EmotionalSignal,
  IStudentSignalsClient,
  LoginActivitySignal,
} from '../../domain/ports/i-student-signals.client';

export interface StudentRiskSignals {
  /** null si el estudiante no tiene registros semanales o el servicio no respondió. */
  emotional: EmotionalSignal | null;
  /** null si el servicio de autenticación no respondió. */
  loginActivity: LoginActivitySignal | null;
}

/** Señales de apoyo del riesgo de deserción de un estudiante, para su docente. */
@Injectable()
export class GetStudentRiskSignalsUseCase {
  constructor(
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
    @Inject('IStudentSignalsClient') private readonly signals: IStudentSignalsClient,
  ) {}

  async execute(
    subjectId: string,
    studentId: string,
    callerId: string,
    callerRole: string,
    correlationId?: string,
  ): Promise<StudentRiskSignals> {
    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.academic.getSubjectOwnership(callerId, subjectId, correlationId);
      if (!isOwner) throw new ForbiddenException('No tienes acceso a este curso');
    }

    const [emotional, loginActivity] = await Promise.all([
      this.signals.getEmotionalState(studentId, subjectId, correlationId).catch(() => null),
      this.signals.getLoginActivity(studentId, correlationId).catch(() => null),
    ]);

    return { emotional, loginActivity };
  }
}