import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Personas y matrícula escolar: ficha del estudiante, vínculo con sus
 * representantes, consentimientos (LOPDP) y matrícula por paralelo.
 *
 * La matrícula de un estudiante en un paralelo (`student_enrollments`) deriva
 * las matrículas por asignatura (`enrollments`) que ya consume el resto del
 * sistema (notas, evaluaciones, analítica).
 */
export class PeopleAndEnrollment1792100000003 implements MigrationInterface {
    name = 'PeopleAndEnrollment1792100000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_profiles" (
            "student_id" uuid NOT NULL,
            "birth_date" date,
            "sex" character varying(1),
            "nationality" character varying(60),
            "address" character varying(300),
            "has_special_needs" boolean NOT NULL DEFAULT false,
            "special_needs_notes" text,
            "emergency_contact_name" character varying(200),
            "emergency_contact_phone" character varying(30),
            "previous_school" character varying(200),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_student_profiles_sex" CHECK ("sex" IS NULL OR "sex" IN ('F','M','X')),
            CONSTRAINT "PK_student_profiles" PRIMARY KEY ("student_id")
        )`);

        await queryRunner.query(`CREATE TABLE "guardian_students" (
            "guardian_id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "relation" character varying(20) NOT NULL,
            "is_primary" boolean NOT NULL DEFAULT false,
            "can_pickup" boolean NOT NULL DEFAULT true,
            "lives_with" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_guardian_students_relation" CHECK ("relation" IN ('MOTHER','FATHER','LEGAL_GUARDIAN','OTHER')),
            CONSTRAINT "CHK_guardian_students_distinct" CHECK ("guardian_id" <> "student_id"),
            CONSTRAINT "PK_guardian_students" PRIMARY KEY ("guardian_id", "student_id")
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_guardian_students_primary" ON "guardian_students" ("student_id") WHERE "is_primary" = true`);
        await queryRunner.query(`CREATE INDEX "idx_guardian_students_student" ON "guardian_students" ("student_id")`);

        await queryRunner.query(`CREATE TABLE "consents" (
            "id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "guardian_id" uuid NOT NULL,
            "purpose" character varying(30) NOT NULL,
            "notice_version" character varying(30) NOT NULL,
            "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "revoked_at" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "CHK_consents_purpose" CHECK ("purpose" IN ('DATA_PROCESSING','IMAGE_USE','AI_ANALYSIS')),
            CONSTRAINT "PK_consents" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_consents_active" ON "consents" ("student_id", "purpose") WHERE "revoked_at" IS NULL`);

        await queryRunner.query(`CREATE TABLE "student_enrollments" (
            "id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "section_id" uuid NOT NULL,
            "school_year_id" uuid NOT NULL,
            "status" character varying(20) NOT NULL DEFAULT 'ACTIVE',
            "enrolled_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "ended_at" TIMESTAMP WITH TIME ZONE,
            "notes" text,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_student_enrollments_status" CHECK ("status" IN ('ACTIVE','WITHDRAWN','TRANSFERRED','PROMOTED','REPEATED')),
            CONSTRAINT "PK_student_enrollments" PRIMARY KEY ("id"),
            CONSTRAINT "FK_student_enrollments_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_student_enrollments_school_year" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE RESTRICT
        )`);
        // Un estudiante solo puede tener una matrícula activa por año lectivo.
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_student_enrollments_active" ON "student_enrollments" ("student_id", "school_year_id") WHERE "status" = 'ACTIVE'`);
        await queryRunner.query(`CREATE INDEX "idx_student_enrollments_section" ON "student_enrollments" ("section_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_student_enrollments_section"`);
        await queryRunner.query(`DROP INDEX "uq_student_enrollments_active"`);
        await queryRunner.query(`DROP TABLE "student_enrollments"`);
        await queryRunner.query(`DROP INDEX "uq_consents_active"`);
        await queryRunner.query(`DROP TABLE "consents"`);
        await queryRunner.query(`DROP INDEX "idx_guardian_students_student"`);
        await queryRunner.query(`DROP INDEX "uq_guardian_students_primary"`);
        await queryRunner.query(`DROP TABLE "guardian_students"`);
        await queryRunner.query(`DROP TABLE "student_profiles"`);
    }
}
