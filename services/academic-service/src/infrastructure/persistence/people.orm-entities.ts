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
  @Column({ name: 'document_type', type: 'varchar', length: 20, default: 'CEDULA' }) documentType!: string;
  @Column({ type: 'varchar', length: 30, nullable: true }) phone!: string | null;
  @Column({ name: 'blood_type', type: 'varchar', length: 3, nullable: true }) bloodType!: string | null;
  @Column({ type: 'text', nullable: true }) allergies!: string | null;
  @Column({ name: 'disability_type', type: 'varchar', length: 30, nullable: true }) disabilityType!: string | null;
  @Column({ name: 'disability_percentage', type: 'smallint', nullable: true }) disabilityPercentage!: number | null;
  @Column({ name: 'conadis_card', type: 'varchar', length: 20, nullable: true }) conadisCard!: string | null;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

/** Encuesta socioeconómica: solo la consulta el DECE. */
@Check('CHK_socioeconomic_income', `"monthly_income_range" IS NULL OR "monthly_income_range" IN ('BELOW_1_SBU','1_TO_2_SBU','2_TO_4_SBU','ABOVE_4_SBU')`)
@Check('CHK_socioeconomic_transport', `"transport_mode" IS NULL OR "transport_mode" IN ('WALK','BUS','CAR','BIKE','OTHER')`)
@Check('CHK_socioeconomic_education', `"guardian_education_level" IS NULL OR "guardian_education_level" IN ('NONE','PRIMARY','SECONDARY','HIGHER')`)
@Check('CHK_socioeconomic_housing', `"housing_type" IS NULL OR "housing_type" IN ('OWNED','RENTED','BORROWED')`)
@Entity('student_socioeconomic_surveys')
export class StudentSocioeconomicSurveyOrmEntity {
  @PrimaryColumn({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'household_members', type: 'smallint', nullable: true }) householdMembers!: number | null;
  @Column({ name: 'monthly_income_range', type: 'varchar', length: 20, nullable: true }) monthlyIncomeRange!: string | null;
  @Column({ name: 'student_works', type: 'boolean', default: false }) studentWorks!: boolean;
  @Column({ name: 'transport_mode', type: 'varchar', length: 20, nullable: true }) transportMode!: string | null;
  @Column({ name: 'commute_minutes', type: 'smallint', nullable: true }) commuteMinutes!: number | null;
  @Column({ name: 'guardian_education_level', type: 'varchar', length: 20, nullable: true }) guardianEducationLevel!: string | null;
  @Column({ name: 'housing_type', type: 'varchar', length: 20, nullable: true }) housingType!: string | null;
  @Column({ name: 'has_internet', type: 'boolean', default: false }) hasInternet!: boolean;
  @Column({ name: 'has_computer', type: 'boolean', default: false }) hasComputer!: boolean;
  @Column({ name: 'receives_government_aid', type: 'boolean', default: false }) receivesGovernmentAid!: boolean;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @Column({ name: 'surveyed_by', type: 'uuid', nullable: true }) surveyedBy!: string | null;
  @Column({ name: 'surveyed_at', type: 'timestamptz', default: () => 'now()' }) surveyedAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

/** Contacto y datos profesionales de docentes, representantes y personal. */
@Entity('user_contact_details')
export class UserContactDetailOrmEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: 30, nullable: true }) phone!: string | null;
  @Column({ name: 'alternate_phone', type: 'varchar', length: 30, nullable: true }) alternatePhone!: string | null;
  @Column({ type: 'varchar', length: 300, nullable: true }) address!: string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) occupation!: string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) specialty!: string | null;
  @Column({ name: 'academic_title', type: 'varchar', length: 200, nullable: true }) academicTitle!: string | null;
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
