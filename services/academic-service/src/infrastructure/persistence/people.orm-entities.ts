import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Check('CHK_student_profiles_sex', `"sex" IS NULL OR "sex" IN ('F','M','X')`)
@Entity('student_profiles')
export class StudentProfileOrmEntity {
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'birth_date', type: 'date', nullable: true }) birthDate!: string | null;
  @Column({ type: 'varchar', length: 1, nullable: true }) sex!: string | null;
  @Column({ type: 'varchar', length: 60, nullable: true }) nationality!: string | null;
  @Column({ type: 'varchar', length: 300, nullable: true }) address!: string | null;
  @Column({ name: 'has_special_needs', type: 'boolean', default: false }) hasSpecialNeeds!: boolean;
  @Column({ name: 'special_needs_notes', type: 'text', nullable: true }) specialNeedsNotes!: string | null;
  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 200, nullable: true }) emergencyContactName!: string | null;
  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 30, nullable: true }) emergencyContactPhone!: string | null;
  @Column({ name: 'previous_school', type: 'varchar', length: 200, nullable: true }) previousSchool!: string | null;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Index('uq_guardian_students_primary', ['studentId'], { unique: true, where: '"is_primary" = true' })
@Index('idx_guardian_students_student', ['studentId'])
@Check('CHK_guardian_students_relation', `"relation" IN ('MOTHER','FATHER','LEGAL_GUARDIAN','OTHER')`)
@Check('CHK_guardian_students_distinct', `"guardian_id" <> "student_id"`)
@Entity('guardian_students')
export class GuardianStudentOrmEntity {
  @PrimaryColumn({ name: 'guardian_id', type: 'uuid' }) guardianId!: string;
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ length: 20 }) relation!: string;
  @Column({ name: 'is_primary', type: 'boolean', default: false }) isPrimary!: boolean;
  @Column({ name: 'can_pickup', type: 'boolean', default: true }) canPickup!: boolean;
  @Column({ name: 'lives_with', type: 'boolean', default: true }) livesWith!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}

@Index('uq_consents_active', ['studentId', 'purpose'], { unique: true, where: '"revoked_at" IS NULL' })
@Check('CHK_consents_purpose', `"purpose" IN ('DATA_PROCESSING','IMAGE_USE','AI_ANALYSIS')`)
@Entity('consents')
export class ConsentOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'guardian_id', type: 'uuid' }) guardianId!: string;
  @Column({ length: 30 }) purpose!: string;
  @Column({ name: 'notice_version', length: 30 }) noticeVersion!: string;
  @Column({ name: 'granted_at', type: 'timestamptz', default: () => 'now()' }) grantedAt!: Date;
  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true }) revokedAt!: Date | null;
}

@Index('uq_student_enrollments_active', ['studentId', 'schoolYearId'], { unique: true, where: `"status" = 'ACTIVE'` })
@Index('idx_student_enrollments_section', ['sectionId'])
@Check('CHK_student_enrollments_status', `"status" IN ('ACTIVE','WITHDRAWN','TRANSFERRED','PROMOTED','REPEATED')`)
@Entity('student_enrollments')
export class StudentEnrollmentOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'section_id', type: 'uuid' }) sectionId!: string;
  @Column({ name: 'school_year_id', type: 'uuid' }) schoolYearId!: string;
  @Column({ length: 20, default: 'ACTIVE' }) status!: string;
  @Column({ name: 'enrolled_at', type: 'timestamptz', default: () => 'now()' }) enrolledAt!: Date;
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true }) endedAt!: Date | null;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
