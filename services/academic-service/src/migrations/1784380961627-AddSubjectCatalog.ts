import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Fase A (docs/database/database-update-plan.md §5.1): separa el catálogo de
 * materia (subject_catalog, existe una vez, independiente del período) de la
 * oferta por período (subjects). Reutiliza el mismo id de cada fila de
 * `subjects` como id de su fila de catálogo — hoy hay una relación 1:1 real
 * (solo existe un período), así que el mapeo es directo y no requiere una
 * tabla temporal de correspondencia.
 */
export class AddSubjectCatalog1784380961627 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject_catalog" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "description" text NOT NULL DEFAULT '', "code" character varying(20) NOT NULL, "credits" integer NOT NULL, "career_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_subject_catalog_code" UNIQUE ("code"), CONSTRAINT "PK_subject_catalog" PRIMARY KEY ("id"))`);

        // Backfill: una fila de catálogo por cada oferta actual, mismo id.
        await queryRunner.query(`INSERT INTO "subject_catalog" ("id", "name", "description", "code", "credits", "career_id", "is_active", "created_at", "updated_at")
            SELECT "id", "name", "description", "code", "credits", "career_id", "is_active", "created_at", "updated_at" FROM "subjects"`);

        await queryRunner.query(`ALTER TABLE "subject_catalog" ADD CONSTRAINT "FK_subject_catalog_career_id" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT`);

        await queryRunner.query(`ALTER TABLE "subjects" ADD "subject_catalog_id" uuid`);
        await queryRunner.query(`UPDATE "subjects" SET "subject_catalog_id" = "id"`);
        await queryRunner.query(`ALTER TABLE "subjects" ALTER COLUMN "subject_catalog_id" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_career_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "UQ_542cbba74dde3c82ab49c573109"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "credits"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "career_id"`);

        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_subject_catalog_id" FOREIGN KEY ("subject_catalog_id") REFERENCES "subject_catalog"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "UQ_subjects_catalog_period" UNIQUE ("subject_catalog_id", "academic_period_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "UQ_subjects_catalog_period"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_subject_catalog_id"`);

        await queryRunner.query(`ALTER TABLE "subjects" ADD "career_id" uuid`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "credits" integer`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "code" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "description" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "name" character varying(200)`);
        await queryRunner.query(`UPDATE "subjects" s SET "name" = sc."name", "code" = sc."code", "credits" = sc."credits", "career_id" = sc."career_id"
            FROM "subject_catalog" sc WHERE sc."id" = s."subject_catalog_id"`);
        await queryRunner.query(`ALTER TABLE "subjects" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ALTER COLUMN "code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ALTER COLUMN "credits" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ALTER COLUMN "career_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "UQ_542cbba74dde3c82ab49c573109" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_career_id" FOREIGN KEY ("career_id") REFERENCES "careers"("id") ON DELETE RESTRICT`);

        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "subject_catalog_id"`);
        await queryRunner.query(`DROP TABLE "subject_catalog"`);
    }

}
