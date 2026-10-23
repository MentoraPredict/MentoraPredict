import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Justificación de faltas. La falta la registra el docente en
 * `session_attendances`; el representante pide justificarla y la autoridad
 * (inspector o administrador) la aprueba o rechaza.
 */
export class AbsenceJustifications1792100000005 implements MigrationInterface {
    name = 'AbsenceJustifications1792100000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "absence_justifications" (
            "id" uuid NOT NULL,
            "session_id" uuid NOT NULL,
            "student_id" uuid NOT NULL,
            "requested_by" uuid NOT NULL,
            "reason" text NOT NULL,
            "status" character varying(10) NOT NULL DEFAULT 'PENDING',
            "resolved_by" uuid,
            "resolved_at" TIMESTAMP WITH TIME ZONE,
            "resolution_note" text,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_absence_justifications_status" CHECK ("status" IN ('PENDING','APPROVED','REJECTED')),
            CONSTRAINT "UQ_absence_justifications_session_student" UNIQUE ("session_id", "student_id"),
            CONSTRAINT "PK_absence_justifications" PRIMARY KEY ("id"),
            CONSTRAINT "FK_absence_justifications_session" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_absence_justifications_student" FOREIGN KEY ("student_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_absence_justifications_requested_by" FOREIGN KEY ("requested_by") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_absence_justifications_resolved_by" FOREIGN KEY ("resolved_by") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);
        await queryRunner.query(`CREATE INDEX "idx_absence_justifications_status" ON "absence_justifications" ("status", "created_at")`);
        await queryRunner.query(`CREATE INDEX "idx_session_attendances_student" ON "session_attendances" ("student_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_session_attendances_student"`);
        await queryRunner.query(`DROP INDEX "idx_absence_justifications_status"`);
        await queryRunner.query(`DROP TABLE "absence_justifications"`);
    }
}
