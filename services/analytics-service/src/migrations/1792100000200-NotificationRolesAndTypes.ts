import { MigrationInterface, QueryRunner } from "typeorm";

/** Nuevos destinatarios (representante, DECE, inspector) y tipos de aviso de asistencia. */
export class NotificationRolesAndTypes1792100000200 implements MigrationInterface {
    name = 'NotificationRolesAndTypes1792100000200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_recipient_role"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_recipient_role" CHECK ("recipient_role" IN ('STUDENT','TEACHER','ADMIN','GUARDIAN','SECRETARY','DECE','INSPECTOR'))`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_type"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED','ATTENDANCE_WARNING','ATTENDANCE_EXCEEDED','JUSTIFICATION_REQUESTED','JUSTIFICATION_RESOLVED','EARLY_ALERT'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "notifications" WHERE "recipient_role" NOT IN ('STUDENT','TEACHER','ADMIN') OR "type" NOT IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED')`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_type"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_type" CHECK ("type" IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED'))`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "CHK_notifications_recipient_role"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "CHK_notifications_recipient_role" CHECK ("recipient_role" IN ('STUDENT','TEACHER','ADMIN'))`);
    }
}
