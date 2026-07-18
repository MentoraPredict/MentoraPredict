import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForeignKeysAndChecks1784335595184 implements MigrationInterface {
    name = 'AddForeignKeysAndChecks1784335595184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" ADD CONSTRAINT "CHK_student_subject_metrics_risk_level" CHECK ("risk_level" IS NULL OR "risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL'))`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "CHK_alerts_severity" CHECK ("severity" IS NULL OR "severity" IN ('MEDIUM','HIGH','CRITICAL'))`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "CHK_alerts_status" CHECK ("status" IN ('UNREAD','READ','ACTIVE','RESOLVED'))`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "CHK_alerts_type" CHECK ("type" IN ('RISK_HIGH','RISK_CRITICAL','AVERAGE_DROP','FAILED_EVALUATIONS','LOW_ATTENDANCE','RISK_ESCALATION'))`);
        await queryRunner.query(`ALTER TABLE "device_tokens" ADD CONSTRAINT "CHK_device_tokens_platform" CHECK ("platform" IN ('ios','android','web'))`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_status" CHECK ("status" IN ('UNREAD','READ'))`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_recipient_role" CHECK ("recipient_role" IN ('STUDENT','TEACHER','ADMIN'))`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED'))`);
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_type"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_recipient_role"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_status"`);
        await queryRunner.query(`ALTER TABLE "device_tokens" DROP CONSTRAINT "CHK_device_tokens_platform"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "CHK_alerts_type"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "CHK_alerts_status"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "CHK_alerts_severity"`);
        await queryRunner.query(`ALTER TABLE "student_subject_metrics" DROP CONSTRAINT "CHK_student_subject_metrics_risk_level"`);
    }

}
