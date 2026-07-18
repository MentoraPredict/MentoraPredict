import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecordedBy, SessionAttendanceEntity } from '../../domain/entities/session-attendance.entity';
import { ISessionAttendanceRepository } from '../../application/ports/output/i-session-attendance.repository';
import { SessionAttendanceOrmEntity } from './session-attendance.orm-entity';

@Injectable()
export class SessionAttendanceRepository implements ISessionAttendanceRepository {
  constructor(
    @InjectRepository(SessionAttendanceOrmEntity)
    private readonly repo: Repository<SessionAttendanceOrmEntity>,
  ) {}

  async findBySession(sessionId: string): Promise<SessionAttendanceEntity[]> {
    const list = await this.repo.find({ where: { sessionId } });
    return list.map((o) => this.toDomain(o));
  }

  async upsert(attendance: SessionAttendanceEntity): Promise<void> {
    await this.repo.upsert(this.toOrm(attendance), ['sessionId', 'studentId']);
  }

  async upsertMany(attendances: SessionAttendanceEntity[]): Promise<void> {
    if (attendances.length === 0) return;
    await this.repo.upsert(attendances.map((a) => this.toOrm(a)), ['sessionId', 'studentId']);
  }

  private toDomain = (o: SessionAttendanceOrmEntity): SessionAttendanceEntity =>
    new SessionAttendanceEntity(
      o.id,
      o.sessionId,
      o.studentId,
      o.present,
      o.recordedBy as AttendanceRecordedBy,
      o.recordedAt,
    );

  private toOrm(d: SessionAttendanceEntity): SessionAttendanceOrmEntity {
    const o = new SessionAttendanceOrmEntity();
    o.id = d.id;
    o.sessionId = d.sessionId;
    o.studentId = d.studentId;
    o.present = d.present;
    o.recordedBy = d.recordedBy;
    o.recordedAt = d.recordedAt;
    return o;
  }
}
