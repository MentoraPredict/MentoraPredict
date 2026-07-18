import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Fase 4d (docs/database/entity-relationship-diagram.md §4.3):
 * - CHECK constraints for every enum-backed status column in academic-service
 *   that Postgres currently accepts as any string (the exact bug that let
 *   seed data write `SUSPENDED` into `enrollments.status` before Fase 1
 *   reconciled EnrollmentStatus in @mentorapredict/shared-types).
 * - The missing unique constraint on `enrollments` — nothing today stops a
 *   student from being enrolled twice in the same subject/period.
 *
 * Existing data verified against every constraint below before writing this
 * migration (see chat history) — no violating rows found.
 */
export class AddCheckConstraintsAndEnrollmentUnique1784325203965 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faculties" ADD CONSTRAINT "CHK_faculties_status" CHECK ("status" IN ('ACTIVE','INACTIVE'))`);
        await queryRunner.query(`ALTER TABLE "careers" ADD CONSTRAINT "CHK_careers_status" CHECK ("status" IN ('ACTIVE','INACTIVE'))`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD CONSTRAINT "CHK_academic_periods_status" CHECK ("status" IN ('PLANNED','ACTIVE','FINISHED','CANCELLED'))`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD CONSTRAINT "CHK_academic_periods_type" CHECK ("type" IN ('SEMESTER','QUARTER'))`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "CHK_enrollments_status" CHECK ("status" IN ('ACTIVE','WITHDRAWN','COMPLETED','SUSPENDED'))`);
        await queryRunner.query(`ALTER TABLE "grade_imports" ADD CONSTRAINT "CHK_grade_imports_status" CHECK ("status" IN ('COMPLETED','COMPLETED_WITH_ERRORS','FAILED'))`);
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD CONSTRAINT "CHK_weekly_check_ins_emotional_state" CHECK ("emotional_state" IN ('GREAT','GOOD','NEUTRAL','BAD','CRITICAL'))`);

        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "UQ_enrollments_student_subject_period" UNIQUE ("student_id", "subject_id", "period_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "UQ_enrollments_student_subject_period"`);

        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP CONSTRAINT "CHK_weekly_check_ins_emotional_state"`);
        await queryRunner.query(`ALTER TABLE "grade_imports" DROP CONSTRAINT "CHK_grade_imports_status"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "CHK_enrollments_status"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP CONSTRAINT "CHK_academic_periods_type"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP CONSTRAINT "CHK_academic_periods_status"`);
        await queryRunner.query(`ALTER TABLE "careers" DROP CONSTRAINT "CHK_careers_status"`);
        await queryRunner.query(`ALTER TABLE "faculties" DROP CONSTRAINT "CHK_faculties_status"`);
    }

}
