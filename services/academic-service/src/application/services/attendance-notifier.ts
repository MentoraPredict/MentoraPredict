import { Inject, Injectable, Logger } from '@nestjs/common';
import { AttendanceStatus, AttendanceSummary } from '../../domain/entities/attendance.entity';
import { INotificationClientPort } from '../ports/output/i-notification-client.port';
import { IPeopleRepository } from '../ports/output/i-people.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';

/**
 * Avisos de asistencia y justificaciones. Nunca interrumpe la operación que
 * los origina: un fallo al notificar solo se registra.
 */
@Injectable()
export class AttendanceNotifier {
  private readonly logger = new Logger(AttendanceNotifier.name);

  constructor(
    @Inject('INotificationClientPort') private readonly notifications: INotificationClientPort,
    @Inject('IPeopleRepository') private readonly people: IPeopleRepository,
    @Inject('IUserProfilePort') private readonly profiles: IUserProfilePort,
  ) {}

  private async studentName(studentId: string): Promise<string> {
    const profile = await this.profiles.getProfile(studentId).catch(() => null);
    return profile ? `${profile.firstName} ${profile.lastName}`.trim() : 'El estudiante';
  }

  private async guardianIds(studentId: string): Promise<string[]> {
    return (await this.people.listGuardiansOfStudent(studentId)).map((g) => g.guardianId);
  }

  private async safely(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (err) {
      this.logger.error(`Attendance notification failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /** Avisa a los representantes (y a inspección si se excede el límite). */
  async notifyThreshold(input: {
    studentId: string;
    courseName: string;
    status: Exclude<AttendanceStatus, 'OK'>;
    summary: AttendanceSummary;
    maxPct: number;
  }): Promise<void> {
    await this.safely(async () => {
      const name = await this.studentName(input.studentId);
      const exceeded = input.status === 'EXCEEDED';
      const type = exceeded ? 'ATTENDANCE_EXCEEDED' : 'ATTENDANCE_WARNING';
      const title = exceeded ? 'Límite de faltas superado' : 'Aviso de faltas injustificadas';
      const message =
        `${name} acumula ${input.summary.unjustifiedPct}% de faltas injustificadas en ` +
        `${input.courseName} (límite ${input.maxPct}%). Puedes justificar las faltas desde el portal.`;

      for (const guardianId of await this.guardianIds(input.studentId)) {
        await this.notifications.notify({
          recipientId: guardianId,
          recipientRole: 'GUARDIAN',
          type,
          title,
          message,
        });
      }
      if (exceeded) {
        await this.notifications.notify({
          broadcastToRole: 'INSPECTOR',
          type,
          title,
          message: `${name} superó el límite de faltas injustificadas en ${input.courseName}.`,
        });
      }
    });
  }

  async notifyJustificationRequested(studentId: string, courseName: string, date: string): Promise<void> {
    await this.safely(async () => {
      const name = await this.studentName(studentId);
      const payload = {
        type: 'JUSTIFICATION_REQUESTED',
        title: 'Nueva justificación de falta',
        message: `Se solicitó justificar la falta de ${name} en ${courseName} del ${date}.`,
      };
      await this.notifications.notify({ ...payload, broadcastToRole: 'INSPECTOR' });
      await this.notifications.notify({ ...payload, broadcastToRole: 'ADMIN' });
    });
  }

  async notifyJustificationResolved(input: {
    studentId: string;
    requestedBy: string;
    courseName: string;
    date: string;
    approved: boolean;
  }): Promise<void> {
    await this.safely(async () => {
      const name = await this.studentName(input.studentId);
      await this.notifications.notify({
        recipientId: input.requestedBy,
        recipientRole: 'GUARDIAN',
        type: 'JUSTIFICATION_RESOLVED',
        title: input.approved ? 'Justificación aprobada' : 'Justificación rechazada',
        message: `La falta de ${name} en ${input.courseName} del ${input.date} fue ${
          input.approved ? 'justificada' : 'rechazada'
        }.`,
      });
    });
  }
}
