import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClassSessionsAndAttendance1784382617967 implements MigrationInterface {
    name = 'AddClassSessionsAndAttendance1784382617967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "class_sessions" ("id" uuid NOT NULL, "subject_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PLANNED', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_class_sessions_subject_week" UNIQUE ("subject_id", "academic_week", "academic_year"), CONSTRAINT "CHK_class_sessions_status" CHECK ("status" IN ('PLANNED','HELD','CANCELLED')), CONSTRAINT "PK_dc034da48c6e0cf95c51f606c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session_attendances" ("id" uuid NOT NULL, "session_id" uuid NOT NULL, "student_id" uuid NOT NULL, "present" boolean NOT NULL, "recorded_by" character varying(30) NOT NULL, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_session_attendances_session_student" UNIQUE ("session_id", "student_id"), CONSTRAINT "CHK_session_attendances_recorded_by" CHECK ("recorded_by" IN ('STUDENT_SELF_REPORT','TEACHER')), CONSTRAINT "PK_1e4253040261f8810f2a4c40f8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD CONSTRAINT "FK_class_sessions_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_attendances" ADD CONSTRAINT "FK_session_attendances_session_id" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_attendances" ADD CONSTRAINT "FK_session_attendances_student_id" FOREIGN KEY ("student_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_attendances" DROP CONSTRAINT "FK_session_attendances_student_id"`);
        await queryRunner.query(`ALTER TABLE "session_attendances" DROP CONSTRAINT "FK_session_attendances_session_id"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" DROP CONSTRAINT "FK_class_sessions_subject_id"`);
        await queryRunner.query(`DROP TABLE "session_attendances"`);
        await queryRunner.query(`DROP TABLE "class_sessions"`);
    }

}
