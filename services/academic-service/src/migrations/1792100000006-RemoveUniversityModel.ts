import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Retira el modelo universitario: facultades, carreras y créditos.
 *
 * Las asignaturas escolares viven en un grado (ver `AcademicStructure`) y se
 * pesan por horas semanales, no por créditos. `down` recrea las tablas y las
 * columnas vacías para poder revertir el esquema, pero no recupera los datos.
 */
export class RemoveUniversityModel1792100000006 implements MigrationInterface {
    name = 'RemoveUniversityModel1792100000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject_catalog" DROP CONSTRAINT IF EXISTS "FK_subject_catalog_career_id"`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" DROP COLUMN IF EXISTS "career_id"`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" DROP COLUMN IF EXISTS "credits"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "careers"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "faculties"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "faculties" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(20) NOT NULL, "description" text NOT NULL DEFAULT '', "status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE ("name"), CONSTRAINT "UQ_f1b2cd43a96c6fb75c8ad44de88" UNIQUE ("code"), CONSTRAINT "CHK_faculties_status" CHECK ("status" IN ('ACTIVE','INACTIVE')), CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "careers" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(20) NOT NULL, "description" text NOT NULL DEFAULT '', "status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "faculty_id" uuid NOT NULL, "duration_semesters" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee40b65408fc3927faa74d478a8" UNIQUE ("code"), CONSTRAINT "CHK_careers_status" CHECK ("status" IN ('ACTIVE','INACTIVE')), CONSTRAINT "PK_febfc45dc83d58090d3122fde3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "careers" ADD CONSTRAINT "FK_careers_faculty_id" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ADD "credits" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ADD "career_id" uuid`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ADD CONSTRAINT "FK_subject_catalog_career_id" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }
}
