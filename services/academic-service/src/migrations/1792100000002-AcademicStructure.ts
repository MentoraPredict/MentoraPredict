import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Estructura académica escolar: grados oficiales, paralelos por año lectivo y
 * malla curricular por grado.
 *
 * `subjects` se conserva como columna vertebral (notas, evaluaciones,
 * matrículas y analítica cuelgan de `subject_id`): una asignatura de un
 * paralelo es una fila de `subjects` con `section_id`. Las filas anteriores
 * (sin paralelo) siguen funcionando hasta que se retire el modelo universitario.
 */
export class AcademicStructure1792100000002 implements MigrationInterface {
    name = 'AcademicStructure1792100000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "grade_levels" (
            "code" character varying(30) NOT NULL,
            "level_code" character varying(30) NOT NULL,
            "name" character varying(100) NOT NULL,
            "ordinal" integer NOT NULL,
            "sort_order" integer NOT NULL,
            CONSTRAINT "PK_grade_levels" PRIMARY KEY ("code"),
            CONSTRAINT "FK_grade_levels_level" FOREIGN KEY ("level_code") REFERENCES "education_levels"("code")
        )`);

        // ⚠️ Los dos subniveles de Educación Inicial deben contrastarse con la norma vigente.
        await queryRunner.query(`INSERT INTO "grade_levels" ("code","level_code","name","ordinal","sort_order") VALUES
            ('INICIAL_1','INICIAL','Inicial 1',1,1),
            ('INICIAL_2','INICIAL','Inicial 2',2,2),
            ('EGB_1','EGB_PREPARATORIA','1.º EGB',1,3),
            ('EGB_2','EGB_ELEMENTAL','2.º EGB',2,4),
            ('EGB_3','EGB_ELEMENTAL','3.º EGB',3,5),
            ('EGB_4','EGB_ELEMENTAL','4.º EGB',4,6),
            ('EGB_5','EGB_MEDIA','5.º EGB',5,7),
            ('EGB_6','EGB_MEDIA','6.º EGB',6,8),
            ('EGB_7','EGB_MEDIA','7.º EGB',7,9),
            ('EGB_8','EGB_SUPERIOR','8.º EGB',8,10),
            ('EGB_9','EGB_SUPERIOR','9.º EGB',9,11),
            ('EGB_10','EGB_SUPERIOR','10.º EGB',10,12),
            ('BGU_1','BGU','1.º BGU',1,13),
            ('BGU_2','BGU','2.º BGU',2,14),
            ('BGU_3','BGU','3.º BGU',3,15),
            ('BT_1','BACHILLERATO_TECNICO','1.º Bachillerato Técnico',1,16),
            ('BT_2','BACHILLERATO_TECNICO','2.º Bachillerato Técnico',2,17),
            ('BT_3','BACHILLERATO_TECNICO','3.º Bachillerato Técnico',3,18)`);

        await queryRunner.query(`CREATE TABLE "sections" (
            "id" uuid NOT NULL,
            "school_year_id" uuid NOT NULL,
            "grade_level_code" character varying(30) NOT NULL,
            "name" character varying(10) NOT NULL,
            "shift" character varying(20) NOT NULL,
            "capacity" integer NOT NULL,
            "tutor_id" uuid,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_sections_year_grade_name" UNIQUE ("school_year_id", "grade_level_code", "name"),
            CONSTRAINT "CHK_sections_shift" CHECK ("shift" IN ('MATUTINA','VESPERTINA','NOCTURNA')),
            CONSTRAINT "CHK_sections_capacity" CHECK ("capacity" > 0),
            CONSTRAINT "PK_sections" PRIMARY KEY ("id"),
            CONSTRAINT "FK_sections_school_year" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE RESTRICT,
            CONSTRAINT "FK_sections_grade_level" FOREIGN KEY ("grade_level_code") REFERENCES "grade_levels"("code") ON DELETE RESTRICT,
            CONSTRAINT "FK_sections_tutor" FOREIGN KEY ("tutor_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT
        )`);
        await queryRunner.query(`CREATE INDEX "idx_sections_year_grade" ON "sections" ("school_year_id", "grade_level_code")`);

        await queryRunner.query(`CREATE TABLE "curriculum_subjects" (
            "grade_level_code" character varying(30) NOT NULL,
            "subject_catalog_id" uuid NOT NULL,
            "weekly_hours" integer NOT NULL,
            CONSTRAINT "CHK_curriculum_hours" CHECK ("weekly_hours" BETWEEN 1 AND 40),
            CONSTRAINT "PK_curriculum_subjects" PRIMARY KEY ("grade_level_code", "subject_catalog_id"),
            CONSTRAINT "FK_curriculum_grade_level" FOREIGN KEY ("grade_level_code") REFERENCES "grade_levels"("code") ON DELETE CASCADE,
            CONSTRAINT "FK_curriculum_subject_catalog" FOREIGN KEY ("subject_catalog_id") REFERENCES "subject_catalog"("id") ON DELETE RESTRICT
        )`);

        // El catálogo deja de ser universitario: sin carrera ni créditos obligatorios.
        await queryRunner.query(`ALTER TABLE "subject_catalog" ALTER COLUMN "career_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ALTER COLUMN "credits" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ADD "area" character varying(50)`);

        // La oferta de una asignatura pasa a ser por paralelo.
        await queryRunner.query(`ALTER TABLE "subjects" ADD "section_id" uuid`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "weekly_hours" integer`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_subjects_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "UQ_subjects_catalog_period"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subjects_catalog_period_legacy" ON "subjects" ("subject_catalog_id", "academic_period_id") WHERE "section_id" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_subjects_catalog_section" ON "subjects" ("subject_catalog_id", "section_id") WHERE "section_id" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_subjects_section" ON "subjects" ("section_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_subjects_section"`);
        await queryRunner.query(`DROP INDEX "uq_subjects_catalog_section"`);
        await queryRunner.query(`DROP INDEX "uq_subjects_catalog_period_legacy"`);
        await queryRunner.query(`DELETE FROM "subjects" WHERE "section_id" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "UQ_subjects_catalog_period" UNIQUE ("subject_catalog_id", "academic_period_id")`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_subjects_section"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "weekly_hours"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "section_id"`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "subject_catalog" ALTER COLUMN "credits" DROP DEFAULT`);
        await queryRunner.query(`DELETE FROM "curriculum_subjects"`);
        await queryRunner.query(`DROP TABLE "curriculum_subjects"`);
        await queryRunner.query(`DROP INDEX "idx_sections_year_grade"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP TABLE "grade_levels"`);
    }
}
