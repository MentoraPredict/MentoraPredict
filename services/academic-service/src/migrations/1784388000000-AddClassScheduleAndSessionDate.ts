import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Corrige el diseño de Fase B: una materia puede tener más de una franja
 * horaria por semana (ej. lunes y miércoles), y el horario cambia cada
 * semestre porque cada semestre es una oferta (subjects) distinta —
 * docs/database/database-update-plan.md §5.2.
 *
 * Introduce `class_schedules` (la franja horaria: día + hora) y hace que
 * `class_sessions` sea la ocurrencia concreta de una franja en una fecha
 * real, en vez de una fila abstracta por semana.
 *
 * Sin dato real de horario disponible (no existe en los seeds), las 513
 * class_sessions ya generadas (Fase B, sin franja horaria asociada) se
 * borran — decisión explícita del usuario, no se inventa un horario falso.
 * `session_attendances` está vacía en la práctica, así que no se pierde
 * ningún registro real de asistencia.
 */
export class AddClassScheduleAndSessionDate1784388000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "class_schedules" ("id" uuid NOT NULL, "subject_id" uuid NOT NULL, "day_of_week" character varying(10) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_class_schedules_subject_day" UNIQUE ("subject_id", "day_of_week"), CONSTRAINT "CHK_class_schedules_day_of_week" CHECK ("day_of_week" IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')), CONSTRAINT "CHK_class_schedules_time_range" CHECK ("end_time" > "start_time"), CONSTRAINT "PK_class_schedules" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "class_schedules" ADD CONSTRAINT "FK_class_schedules_subject_id" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE`);

        // Sin horario real disponible para backfillear — se borran (ver nota arriba).
        await queryRunner.query(`DELETE FROM "class_sessions"`);

        await queryRunner.query(`ALTER TABLE "class_sessions" DROP CONSTRAINT "UQ_class_sessions_subject_week"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD "schedule_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD "session_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD CONSTRAINT "FK_class_sessions_schedule_id" FOREIGN KEY ("schedule_id") REFERENCES "class_schedules"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD CONSTRAINT "UQ_class_sessions_subject_date" UNIQUE ("subject_id", "session_date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_sessions" DROP CONSTRAINT "UQ_class_sessions_subject_date"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" DROP CONSTRAINT "FK_class_sessions_schedule_id"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" DROP COLUMN "session_date"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" DROP COLUMN "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "class_sessions" ADD CONSTRAINT "UQ_class_sessions_subject_week" UNIQUE ("subject_id", "academic_week", "academic_year")`);

        await queryRunner.query(`ALTER TABLE "class_schedules" DROP CONSTRAINT "FK_class_schedules_subject_id"`);
        await queryRunner.query(`DROP TABLE "class_schedules"`);
    }

}
