import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Calificación escolar, cierre de periodos, supletorio y promoción.
 *
 * Las actividades evaluables siguen siendo filas de `evaluations` (y sus notas
 * filas de `grades`), pero ahora se asocian a un periodo de calificación y a un
 * componente de la nota. La nota del periodo, el promedio anual y el resultado
 * por asignatura se calculan con la configuración institucional; al cerrar un
 * periodo se guarda una foto en `period_results` para que el resultado no
 * cambie aunque después se edite la configuración.
 */
export class GradingAndPromotion1792100000004 implements MigrationInterface {
    name = 'GradingAndPromotion1792100000004'

    private readonly INSTITUTION_ID = '00000000-0000-4000-8000-000000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "grading_components" (
            "institution_id" uuid NOT NULL,
            "code" character varying(20) NOT NULL,
            "name" character varying(60) NOT NULL,
            "weight" numeric(5,2) NOT NULL,
            "sort_order" integer NOT NULL DEFAULT 0,
            CONSTRAINT "CHK_grading_components_weight" CHECK ("weight" > 0 AND "weight" <= 100),
            CONSTRAINT "PK_grading_components" PRIMARY KEY ("institution_id", "code"),
            CONSTRAINT "FK_grading_components_institution" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE
        )`);

        // ⚠️ Pesos 70/30 según la práctica vigente; se editan desde el panel.
        await queryRunner.query(
            `INSERT INTO "grading_components" ("institution_id","code","name","weight","sort_order") VALUES
                ($1,'FORMATIVE','Formativa',70,1),
                ($1,'SUMMATIVE','Sumativa',30,2)`,
            [this.INSTITUTION_ID],
        );

        await queryRunner.query(`ALTER TABLE "promotion_rules" ADD "supplementary_min_average" numeric(5,2) NOT NULL DEFAULT 4`);

        await queryRunner.query(`ALTER TABLE "evaluations" ADD "period_id" uuid`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD "component_code" character varying(20)`);
        await queryRunner.query(`UPDATE "evaluations" e SET "period_id" = s."academic_period_id" FROM "subjects" s WHERE s."id" = e."subject_id"`);
        await queryRunner.query(`ALTER TABLE "evaluations" ADD CONSTRAINT "FK_evaluations_period" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`CREATE INDEX "idx_evaluations_subject_period" ON "evaluations" ("subject_id", "period_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_grades_student_evaluation" ON "grades" ("student_id", "evaluation_id") WHERE "evaluation_id" IS NOT NULL`);

        await queryRunner.query(`ALTER TABLE "academic_periods" ADD "closed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD "closed_by" uuid`);

        await queryRunner.query(`CREATE TABLE "period_closures" (
            "id" uuid NOT NULL,
            "period_id" uuid NOT NULL,
            "action" character varying(10) NOT NULL,
            "reason" text,
            "performed_by" uuid NOT NULL,
            "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_period_closures_action" CHECK ("action" IN ('CLOSE','REOPEN')),
            CONSTRAINT "PK_period_closures" PRIMARY KEY ("id"),
            CONSTRAINT "FK_period_closures_period" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_period_closures_user" FOREIGN KEY ("performed_by") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);
        await queryRunner.query(`CREATE INDEX "idx_period_closures_period" ON "period_closures" ("period_id", "performed_at")`);

        await queryRunner.query(`CREATE TABLE "period_results" (
            "period_id" uuid NOT NULL,
            "subject_id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "value" numeric(5,2),
            "is_complete" boolean NOT NULL DEFAULT false,
            "band_code" character varying(30),
            "closed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_period_results" PRIMARY KEY ("period_id", "subject_id", "student_id"),
            CONSTRAINT "FK_period_results_period" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_period_results_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_period_results_student" FOREIGN KEY ("student_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);
        await queryRunner.query(`CREATE INDEX "idx_period_results_student" ON "period_results" ("student_id")`);

        await queryRunner.query(`CREATE TABLE "supplementary_grades" (
            "subject_id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "value" numeric(5,2) NOT NULL,
            "registered_by" uuid NOT NULL,
            "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_supplementary_grades" PRIMARY KEY ("subject_id", "student_id"),
            CONSTRAINT "FK_supplementary_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_supplementary_student" FOREIGN KEY ("student_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_supplementary_registered_by" FOREIGN KEY ("registered_by") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);

        await queryRunner.query(`CREATE TABLE "promotion_decisions" (
            "student_enrollment_id" uuid NOT NULL,
            "outcome" character varying(10) NOT NULL,
            "suggested" character varying(30) NOT NULL,
            "is_override" boolean NOT NULL DEFAULT false,
            "notes" text,
            "decided_by" uuid NOT NULL,
            "decided_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_promotion_decisions_outcome" CHECK ("outcome" IN ('PROMOTED','REPEATS')),
            CONSTRAINT "PK_promotion_decisions" PRIMARY KEY ("student_enrollment_id"),
            CONSTRAINT "FK_promotion_decisions_enrollment" FOREIGN KEY ("student_enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_promotion_decisions_user" FOREIGN KEY ("decided_by") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "promotion_decisions"`);
        await queryRunner.query(`DROP TABLE "supplementary_grades"`);
        await queryRunner.query(`DROP INDEX "idx_period_results_student"`);
        await queryRunner.query(`DROP TABLE "period_results"`);
        await queryRunner.query(`DROP INDEX "idx_period_closures_period"`);
        await queryRunner.query(`DROP TABLE "period_closures"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP COLUMN "closed_by"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP COLUMN "closed_at"`);
        await queryRunner.query(`DROP INDEX "uq_grades_student_evaluation"`);
        await queryRunner.query(`DROP INDEX "idx_evaluations_subject_period"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP CONSTRAINT "FK_evaluations_period"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "component_code"`);
        await queryRunner.query(`ALTER TABLE "evaluations" DROP COLUMN "period_id"`);
        await queryRunner.query(`ALTER TABLE "promotion_rules" DROP COLUMN "supplementary_min_average"`);
        await queryRunner.query(`DROP TABLE "grading_components"`);
    }
}
