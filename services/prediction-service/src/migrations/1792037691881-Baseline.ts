import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1792037691881 implements MigrationInterface {
    name = 'Baseline1792037691881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "prediction_user_references" ("id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0995140e98052f5acc396cd7fb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prediction_subject_references" ("id" uuid NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2fa3ab883716dee87a6e07f969a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prediction_period_references" ("id" uuid NOT NULL, "status" character varying(20) NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a518c424fe133b8b9ad4ced276a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_subject_predictions" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "status" character varying(30) NOT NULL, "predicted_risk_level" character varying(20), "trend_slope" numeric(6,2), "recommendation" text, "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "CHK_student_subject_predictions_risk_level" CHECK ("predicted_risk_level" IS NULL OR "predicted_risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL')), CONSTRAINT "CHK_student_subject_predictions_status" CHECK ("status" IN ('COMPUTED','INSUFFICIENT_DATA')), CONSTRAINT "PK_7e32271150891d9cfe5e3310663" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subject_prediction_student_subject_week" ON "student_subject_predictions"  ("student_id", "subject_id", "academic_week", "academic_year") `);
        await queryRunner.query(`CREATE TABLE "prediction_logs" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "period_id" uuid NOT NULL, "subject_id" uuid, "risk" jsonb NOT NULL, "summary" text NOT NULL, "recommendations" jsonb NOT NULL, "model_version" character varying(50) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9413cebaa48a6674bd0836eebb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_prediction_logs_student_subject_created" ON "prediction_logs"  ("student_id", "subject_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_student_id" FOREIGN KEY ("student_id") REFERENCES "prediction_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_subject_id" FOREIGN KEY ("subject_id") REFERENCES "prediction_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_period_id" FOREIGN KEY ("period_id") REFERENCES "prediction_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prediction_logs" ADD CONSTRAINT "FK_prediction_logs_student_id" FOREIGN KEY ("student_id") REFERENCES "prediction_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prediction_logs" ADD CONSTRAINT "FK_prediction_logs_subject_id" FOREIGN KEY ("subject_id") REFERENCES "prediction_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prediction_logs" ADD CONSTRAINT "FK_prediction_logs_period_id" FOREIGN KEY ("period_id") REFERENCES "prediction_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prediction_logs" DROP CONSTRAINT "FK_prediction_logs_period_id"`);
        await queryRunner.query(`ALTER TABLE "prediction_logs" DROP CONSTRAINT "FK_prediction_logs_subject_id"`);
        await queryRunner.query(`ALTER TABLE "prediction_logs" DROP CONSTRAINT "FK_prediction_logs_student_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_period_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_subject_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_student_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prediction_logs_student_subject_created"`);
        await queryRunner.query(`DROP TABLE "prediction_logs"`);
        await queryRunner.query(`DROP INDEX "public"."uq_subject_prediction_student_subject_week"`);
        await queryRunner.query(`DROP TABLE "student_subject_predictions"`);
        await queryRunner.query(`DROP TABLE "prediction_period_references"`);
        await queryRunner.query(`DROP TABLE "prediction_subject_references"`);
        await queryRunner.query(`DROP TABLE "prediction_user_references"`);
    }

}
