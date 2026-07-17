import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1784320685644 implements MigrationInterface {
    name = 'Baseline1784320685644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_metrics" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "period_id" uuid NOT NULL, "subject_averages" jsonb NOT NULL DEFAULT '{}', "global_average" numeric(5,2) NOT NULL, "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "version" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_c7646bbe0b37bc46043844d85f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_subject_metrics" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "average_grade" numeric(4,2), "compliance_index" integer, "attendance_rate" integer, "study_hours" numeric(5,2), "comprehension_avg" integer, "risk_level" character varying(20), "trend_slope" numeric(6,2), "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5160a3e4330f1760faa291aed5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subject_metrics_student_subject_week" ON "student_subject_metrics"  ("student_id", "subject_id", "academic_week", "academic_year") `);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "type" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'UNREAD', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb NOT NULL DEFAULT '{}', "subject_id" uuid, "period_id" uuid, "severity" character varying(20), "triggered_at" TIMESTAMP WITH TIME ZONE, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolved_by" uuid, CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_active_alert_student_subject" ON "alerts"  ("student_id", "subject_id") WHERE status = 'ACTIVE'`);
        await queryRunner.query(`CREATE TABLE "device_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "expo_push_token" character varying(255) NOT NULL, "platform" character varying(10) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f81462ef82a81bf4b7894ff1493" UNIQUE ("expo_push_token"), CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_device_token_user" ON "device_tokens"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL, "recipient_id" uuid NOT NULL, "recipient_role" character varying(20) NOT NULL, "type" character varying(30) NOT NULL, "related_alert_id" uuid, "subject_id" uuid, "student_id" uuid, "period_id" uuid, "title" character varying(200) NOT NULL, "message" text NOT NULL, "status" character varying(10) NOT NULL DEFAULT 'UNREAD', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "read_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_notification_recipient_status" ON "notifications"  ("recipient_id", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_notification_recipient_status"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP INDEX "public"."idx_device_token_user"`);
        await queryRunner.query(`DROP TABLE "device_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."uq_active_alert_student_subject"`);
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP INDEX "public"."uq_subject_metrics_student_subject_week"`);
        await queryRunner.query(`DROP TABLE "student_subject_metrics"`);
        await queryRunner.query(`DROP TABLE "student_metrics"`);
    }

}
