import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { ClassSessionOrmEntity } from './class-session.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

/**
 * Registro de asistencia de un estudiante a una sesión — autorreportado
 * (STUDENT_SELF_REPORT, desde UpsertCheckInUseCase) o registrado por el
 * docente (TEACHER, desde RegisterSessionAttendanceUseCase). Ver la regla
 * de precedencia en docs/database/database-update-plan.md §5.2.
 */
@Entity('session_attendances')
@Unique('UQ_session_attendances_session_student', ['sessionId', 'studentId'])
@Check('CHK_session_attendances_recorded_by', `"recorded_by" IN ('STUDENT_SELF_REPORT','TEACHER')`)
export class SessionAttendanceOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'session_id', type: 'uuid' }) sessionId!: string;
  @ManyToOne(() => ClassSessionOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id', foreignKeyConstraintName: 'FK_session_attendances_session_id' })
  session?: ClassSessionOrmEntity;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_session_attendances_student_id' })
  student?: UserReferenceOrmEntity;

  @Column() present!: boolean;
  @Column({ name: 'recorded_by', length: 30 }) recordedBy!: string;
  @Column({ name: 'recorded_at', type: 'timestamptz' }) recordedAt!: Date;
}
