import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1792037686829 implements MigrationInterface {
    name = 'Baseline1792037686829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "analytics_user_references" ("id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_455b7b3efe6332c764917247355" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_period_references" ("id" uuid NOT NULL, "status" character varying(20) NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_19425871b2cf7711faf11f4b871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_metrics" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "period_id" uuid NOT NULL, "subject_averages" jsonb NOT NULL DEFAULT '{}', "global_average" numeric(5,2) NOT NULL, "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "version" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_c7646bbe0b37bc46043844d85f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_subject_references" ("id" uuid NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_1fc734d1ac3b765d917637691c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_subject_metrics" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "average_grade" numeric(4,2), "compliance_index" integer, "attendance_rate" integer, "study_hours" numeric(5,2), "comprehension_avg" integer, "risk_level" character varying(20), "trend_slope" numeric(6,2), "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "CHK_student_subject_metrics_risk_level" CHECK ("risk_level" IS NULL OR "risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL')), CONSTRAINT "PK_5160a3e4330f1760faa291aed5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subject_metrics_student_subject_week" ON "student_subject_metrics"  ("student_id", "subject_id", "academic_week", "academic_year") `);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "type" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'UNREAD', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb NOT NULL DEFAULT '{}', "subject_id" uuid, "period_id" uuid, "severity" character varying(20), "triggered_at" TIMESTAMP WITH TIME ZONE, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolved_by" uuid, CONSTRAINT "CHK_alerts_severity" CHECK ("severity" IS NULL OR "severity" IN ('MEDIUM','HIGH','CRITICAL')), CONSTRAINT "CHK_alerts_status" CHECK ("status" IN ('UNREAD','READ','ACTIVE','RESOLVED')), CONSTRAINT "CHK_alerts_type" CHECK ("type" IN ('RISK_HIGH','RISK_CRITICAL','AVERAGE_DROP','FAILED_EVALUATIONS','LOW_ATTENDANCE','RISK_ESCALATION')), CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_active_alert_student_subject" ON "alerts"  ("student_id", "subject_id") WHERE status = 'ACTIVE'`);
        await queryRunner.query(`CREATE TABLE "device_tokens" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "expo_push_token" character varying(255) NOT NULL, "platform" character varying(10) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f81462ef82a81bf4b7894ff1493" UNIQUE ("expo_push_token"), CONSTRAINT "CHK_device_tokens_platform" CHECK ("platform" IN ('ios','android','web')), CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_device_token_user" ON "device_tokens"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL, "recipient_id" uuid NOT NULL, "recipient_role" character varying(20) NOT NULL, "type" character varying(30) NOT NULL, "related_alert_id" uuid, "subject_id" uuid, "student_id" uuid, "period_id" uuid, "title" character varying(200) NOT NULL, "message" text NOT NULL, "status" character varying(10) NOT NULL DEFAULT 'UNREAD', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "read_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_notifications_status" CHECK ("status" IN ('UNREAD','READ')), CONSTRAINT "CHK_notifications_recipient_role" CHECK ("recipient_role" IN ('STUDENT','TEACHER','ADMIN')), CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED')), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_notification_recipient_status" ON "notifications"  ("recipient_id", "status") `);
        await queryRunner.query(`CREATE TABLE "dataset_versions" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "inputs" jsonb NOT NULL, "result" jsonb NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2335c164f3df47dabfe7d0fc6e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_dataset_versions_student_type_timestamp" ON "dataset_versions"  ("student_id", "type", "timestamp") `);
        await queryRunner.query(`ALTER TABLE "student_metrics" ADD CONSTRAINT "FK_student_metrics_student_id" FOREIGN KEY ("student_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_metrics" ADD CONSTRAINT "FK_student_metrics_period_id" FOREIGN KEY ("period_id") REFERENCES "analytics_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" ADD CONSTRAINT "FK_student_subject_metrics_student_id" FOREIGN KEY ("student_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" ADD CONSTRAINT "FK_student_subject_metrics_subject_id" FOREIGN KEY ("subject_id") REFERENCES "analytics_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" ADD CONSTRAINT "FK_student_subject_metrics_period_id" FOREIGN KEY ("period_id") REFERENCES "analytics_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_alerts_student_id" FOREIGN KEY ("student_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_alerts_resolved_by" FOREIGN KEY ("resolved_by") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_alerts_subject_id" FOREIGN KEY ("subject_id") REFERENCES "analytics_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_alerts_period_id" FOREIGN KEY ("period_id") REFERENCES "analytics_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device_tokens" ADD CONSTRAINT "FK_device_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_related_alert_id" FOREIGN KEY ("related_alert_id") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_recipient_id" FOREIGN KEY ("recipient_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_subject_id" FOREIGN KEY ("subject_id") REFERENCES "analytics_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_student_id" FOREIGN KEY ("student_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_period_id" FOREIGN KEY ("period_id") REFERENCES "analytics_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_versions" ADD CONSTRAINT "FK_dataset_versions_student_id" FOREIGN KEY ("student_id") REFERENCES "analytics_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dataset_versions" DROP CONSTRAINT "FK_dataset_versions_student_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_period_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_student_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_subject_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_recipient_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_related_alert_id"`);
        await queryRunner.query(`ALTER TABLE "device_tokens" DROP CONSTRAINT "FK_device_tokens_user_id"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_period_id"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_subject_id"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_resolved_by"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_alerts_student_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" DROP CONSTRAINT "FK_student_subject_metrics_period_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" DROP CONSTRAINT "FK_student_subject_metrics_subject_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" DROP CONSTRAINT "FK_student_subject_metrics_student_id"`);
        await queryRunner.query(`ALTER TABLE "student_metrics" DROP CONSTRAINT "FK_student_metrics_period_id"`);
        await queryRunner.query(`ALTER TABLE "student_metrics" DROP CONSTRAINT "FK_student_metrics_student_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_dataset_versions_student_type_timestamp"`);
        await queryRunner.query(`DROP TABLE "dataset_versions"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notification_recipient_status"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP INDEX "public"."idx_device_token_user"`);
        await queryRunner.query(`DROP TABLE "device_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."uq_active_alert_student_subject"`);
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP INDEX "public"."uq_subject_metrics_student_subject_week"`);
        await queryRunner.query(`DROP TABLE "student_subject_metrics"`);
        await queryRunner.query(`DROP TABLE "analytics_subject_references"`);
        await queryRunner.query(`DROP TABLE "student_metrics"`);
        await queryRunner.query(`DROP TABLE "analytics_period_references"`);
        await queryRunner.query(`DROP TABLE "analytics_user_references"`);
    }

}
