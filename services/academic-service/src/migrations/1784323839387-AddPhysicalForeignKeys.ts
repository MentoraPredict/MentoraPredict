import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the 23 physical FK constraints proposed in
 * docs/database/entity-relationship-diagram.md §4.3 (academic-service).
 *
 * Deliberately does NOT convert the corresponding *.orm-entity.ts columns
 * into TypeORM `@ManyToOne` relations — every repository/query-builder in
 * this service already treats these as plain string ids, and touching that
 * would be a much larger, riskier refactor for no gain: the actual goal
 * (Postgres enforcing referential integrity) is fully achieved by the raw
 * constraint alone. A future `migration:generate` won't see these FKs in
 * entity metadata and may propose dropping them — that's expected; review
 * and discard that proposal rather than applying it.
 *
 * Requires the Fase 4b backfill (backfill-user-references.ts) to have run
 * first for every *_id column pointing at user_references — otherwise this
 * migration fails on the first pre-existing row with an unmirrored id.
 */
export class AddPhysicalForeignKeys1784323839387 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // careers
        await queryRunner.query(`ALTER TABLE "careers" ADD CONSTRAINT "FK_careers_faculty_id" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT`);

        // subjects
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_career_id" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_academic_period_id" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES "user_references"("id") ON DELETE RESTRICT`);

        // evaluations
        await queryRunner.query(`ALTER TABLE "evaluations" ADD CONSTRAINT "FK_evaluations_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE`);

        // enrollments
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_period_id" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_student_id" FOREIGN KEY ("student_id") REFERENCES "user_references"("id") ON DELETE RESTRICT`);

        // grades
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_grades_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_grades_evaluation_id" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_grades_student_id" FOREIGN KEY ("student_id") REFERENCES "user_references"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_grades_registered_by" FOREIGN KEY ("registered_by") REFERENCES "user_references"("id") ON DELETE RESTRICT`);

        // grade_history
        await queryRunner.query(`ALTER TABLE "grade_history" ADD CONSTRAINT "FK_grade_history_grade_id" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grade_history" ADD CONSTRAINT "FK_grade_history_changed_by" FOREIGN KEY ("changed_by") REFERENCES "user_references"("id") ON DELETE RESTRICT`);

        // subject_teachers
        await queryRunner.query(`ALTER TABLE "subject_teachers" ADD CONSTRAINT "FK_subject_teachers_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "subject_teachers" ADD CONSTRAINT "FK_subject_teachers_period_id" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "subject_teachers" ADD CONSTRAINT "FK_subject_teachers_teacher_id" FOREIGN KEY ("teacher_id") REFERENCES "user_references"("id") ON DELETE CASCADE`);

        // grade_imports
        await queryRunner.query(`ALTER TABLE "grade_imports" ADD CONSTRAINT "FK_grade_imports_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "grade_imports" ADD CONSTRAINT "FK_grade_imports_imported_by" FOREIGN KEY ("imported_by") REFERENCES "user_references"("id") ON DELETE RESTRICT`);

        // topics
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_topics_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE`);

        // weekly_check_ins
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD CONSTRAINT "FK_weekly_check_ins_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD CONSTRAINT "FK_weekly_check_ins_period_id" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD CONSTRAINT "FK_weekly_check_ins_student_id" FOREIGN KEY ("student_id") REFERENCES "user_references"("id") ON DELETE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP CONSTRAINT "FK_weekly_check_ins_student_id"`);
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP CONSTRAINT "FK_weekly_check_ins_period_id"`);
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP CONSTRAINT "FK_weekly_check_ins_subject_id"`);

        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_topics_subject_id"`);

        await queryRunner.query(`ALTER TABLE "grade_imports" DROP CONSTRAINT "FK_grade_imports_imported_by"`);
        await queryRunner.query(`ALTER TABLE "grade_imports" DROP CONSTRAINT "FK_grade_imports_subject_id"`);

        await queryRunner.query(`ALTER TABLE "subject_teachers" DROP CONSTRAINT "FK_subject_teachers_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "subject_teachers" DROP CONSTRAINT "FK_subject_teachers_period_id"`);
        await queryRunner.query(`ALTER TABLE "subject_teachers" DROP CONSTRAINT "FK_subject_teachers_subject_id"`);

        await queryRunner.query(`ALTER TABLE "grade_history" DROP CONSTRAINT "FK_grade_history_changed_by"`);
        await queryRunner.query(`ALTER TABLE "grade_history" DROP CONSTRAINT "FK_grade_history_grade_id"`);

        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_registered_by"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_student_id"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_evaluation_id"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_subject_id"`);

        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_student_id"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_period_id"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_subject_id"`);

        await queryRunner.query(`ALTER TABLE "evaluations" DROP CONSTRAINT "FK_evaluations_subject_id"`);

        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_academic_period_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_career_id"`);

        await queryRunner.query(`ALTER TABLE "careers" DROP CONSTRAINT "FK_careers_faculty_id"`);
    }

}
