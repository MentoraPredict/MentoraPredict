import { Check, Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Check('CHK_grading_components_weight', `"weight" > 0 AND "weight" <= 100`)
@Entity('grading_components')
export class GradingComponentOrmEntity {
  @PrimaryColumn({ name: 'institution_id', type: 'uuid' }) institutionId!: string;
  @PrimaryColumn({ length: 20 }) code!: string;
  @Column({ length: 60 }) name!: string;
  @Column({ type: 'numeric', precision: 5, scale: 2 }) weight!: string;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder!: number;
}

@Index('idx_period_closures_period', ['periodId', 'performedAt'])
@Check('CHK_period_closures_action', `"action" IN ('CLOSE','REOPEN')`)
@Entity('period_closures')
export class PeriodClosureOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @Column({ length: 10 }) action!: string;
  @Column({ type: 'text', nullable: true }) reason!: string | null;
  @Column({ name: 'performed_by', type: 'uuid' }) performedBy!: string;
  @Column({ name: 'performed_at', type: 'timestamptz', default: () => 'now()' }) performedAt!: Date;
}

@Index('idx_period_results_student', ['studentId'])
@Entity('period_results')
export class PeriodResultOrmEntity {
  @PrimaryColumn({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @PrimaryColumn({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true }) value!: string | null;
  @Column({ name: 'is_complete', type: 'boolean', default: false }) isComplete!: boolean;
  @Column({ name: 'band_code', type: 'varchar', length: 30, nullable: true }) bandCode!: string | null;
  @Column({ name: 'closed_at', type: 'timestamptz', default: () => 'now()' }) closedAt!: Date;
}

@Entity('supplementary_grades')
export class SupplementaryGradeOrmEntity {
  @PrimaryColumn({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ type: 'numeric', precision: 5, scale: 2 }) value!: string;
  @Column({ name: 'registered_by', type: 'uuid' }) registeredBy!: string;
  @Column({ name: 'registered_at', type: 'timestamptz', default: () => 'now()' }) registeredAt!: Date;
}

@Check('CHK_promotion_decisions_outcome', `"outcome" IN ('PROMOTED','REPEATS')`)
@Entity('promotion_decisions')
export class PromotionDecisionOrmEntity {
  @PrimaryColumn({ name: 'student_enrollment_id', type: 'uuid' }) studentEnrollmentId!: string;
  @Column({ length: 10 }) outcome!: string;
  @Column({ length: 30 }) suggested!: string;
  @Column({ name: 'is_override', type: 'boolean', default: false }) isOverride!: boolean;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @Column({ name: 'decided_by', type: 'uuid' }) decidedBy!: string;
  @Column({ name: 'decided_at', type: 'timestamptz', default: () => 'now()' }) decidedAt!: Date;
}
