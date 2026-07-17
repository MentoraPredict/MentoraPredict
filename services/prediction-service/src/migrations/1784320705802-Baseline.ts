import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1784320705802 implements MigrationInterface {
    name = 'Baseline1784320705802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_subject_predictions" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "status" character varying(30) NOT NULL, "predicted_risk_level" character varying(20), "trend_slope" numeric(6,2), "recommendation" text, "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7e32271150891d9cfe5e3310663" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subject_prediction_student_subject_week" ON "student_subject_predictions"  ("student_id", "subject_id", "academic_week", "academic_year") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_subject_prediction_student_subject_week"`);
        await queryRunner.query(`DROP TABLE "student_subject_predictions"`);
    }

}
