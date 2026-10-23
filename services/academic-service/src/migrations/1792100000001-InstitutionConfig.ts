import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Configuración institucional editable desde el panel admin: institución,
 * catálogo de niveles, escala de calificaciones, regla de asistencia y
 * reglas de promoción.
 *
 * Los valores sembrados son los iniciales del MINEDUC; los marcados con ⚠️ en
 * docs/erp-escolar/02-marco-normativo-ecuador.md deben verificarse contra el
 * texto vigente y se corrigen desde el panel, sin tocar código.
 */
export class InstitutionConfig1792100000001 implements MigrationInterface {
    name = 'InstitutionConfig1792100000001'

    private readonly INSTITUTION_ID = '00000000-0000-4000-8000-000000000001';
    private readonly SCALE_ID = '00000000-0000-4000-8000-0000000000a1';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "institutions" (
            "id" uuid NOT NULL,
            "amie" character varying(20),
            "name" character varying(200) NOT NULL,
            "sustentation" character varying(20) NOT NULL DEFAULT 'FISCAL',
            "regime" character varying(20) NOT NULL DEFAULT 'SIERRA_AMAZONIA',
            "zone" character varying(100),
            "district" character varying(100),
            "address" character varying(300),
            "phone" character varying(30),
            "email" character varying(255),
            "rector_name" character varying(200),
            "logo_url" character varying(500),
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_institutions_amie" UNIQUE ("amie"),
            CONSTRAINT "CHK_institutions_sustentation" CHECK ("sustentation" IN ('FISCAL','FISCOMISIONAL','MUNICIPAL','PARTICULAR')),
            CONSTRAINT "CHK_institutions_regime" CHECK ("regime" IN ('SIERRA_AMAZONIA','COSTA_GALAPAGOS')),
            CONSTRAINT "PK_institutions" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "education_levels" (
            "code" character varying(30) NOT NULL,
            "name" character varying(100) NOT NULL,
            "level_group" character varying(20) NOT NULL,
            "sort_order" integer NOT NULL,
            "evaluation_mode" character varying(20) NOT NULL,
            "allows_supplementary" boolean NOT NULL DEFAULT false,
            CONSTRAINT "CHK_education_levels_mode" CHECK ("evaluation_mode" IN ('QUALITATIVE','MIXED')),
            CONSTRAINT "PK_education_levels" PRIMARY KEY ("code")
        )`);

        await queryRunner.query(`CREATE TABLE "institution_levels" (
            "institution_id" uuid NOT NULL,
            "level_code" character varying(30) NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "shifts" jsonb NOT NULL DEFAULT '[]',
            CONSTRAINT "PK_institution_levels" PRIMARY KEY ("institution_id", "level_code"),
            CONSTRAINT "FK_institution_levels_institution" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_institution_levels_level" FOREIGN KEY ("level_code") REFERENCES "education_levels"("code")
        )`);

        await queryRunner.query(`CREATE TABLE "grading_scales" (
            "id" uuid NOT NULL,
            "institution_id" uuid NOT NULL,
            "name" character varying(100) NOT NULL,
            "min_value" numeric(5,2) NOT NULL,
            "max_value" numeric(5,2) NOT NULL,
            "passing_grade" numeric(5,2) NOT NULL,
            "decimals" integer NOT NULL DEFAULT 2,
            "is_default" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_grading_scales_range" CHECK ("min_value" < "max_value" AND "passing_grade" BETWEEN "min_value" AND "max_value"),
            CONSTRAINT "PK_grading_scales" PRIMARY KEY ("id"),
            CONSTRAINT "FK_grading_scales_institution" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_default_grading_scale" ON "grading_scales" ("institution_id") WHERE "is_default" = true`);

        await queryRunner.query(`CREATE TABLE "grading_scale_bands" (
            "id" uuid NOT NULL,
            "scale_id" uuid NOT NULL,
            "code" character varying(20) NOT NULL,
            "label" character varying(200) NOT NULL,
            "min_value" numeric(5,2) NOT NULL,
            "max_value" numeric(5,2) NOT NULL,
            "sort_order" integer NOT NULL,
            CONSTRAINT "UQ_grading_scale_bands_code" UNIQUE ("scale_id", "code"),
            CONSTRAINT "CHK_grading_scale_bands_range" CHECK ("min_value" <= "max_value"),
            CONSTRAINT "PK_grading_scale_bands" PRIMARY KEY ("id"),
            CONSTRAINT "FK_grading_scale_bands_scale" FOREIGN KEY ("scale_id") REFERENCES "grading_scales"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "attendance_rules" (
            "institution_id" uuid NOT NULL,
            "max_unjustified_pct" numeric(5,2) NOT NULL,
            "warning_pcts" jsonb NOT NULL DEFAULT '[]',
            "applies_from_level_order" integer NOT NULL,
            "justification_days" integer,
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_attendance_rules_pct" CHECK ("max_unjustified_pct" > 0 AND "max_unjustified_pct" <= 100),
            CONSTRAINT "PK_attendance_rules" PRIMARY KEY ("institution_id"),
            CONSTRAINT "FK_attendance_rules_institution" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE
        )`);

        await queryRunner.query(`CREATE TABLE "promotion_rules" (
            "institution_id" uuid NOT NULL,
            "level_code" character varying(30) NOT NULL,
            "min_average" numeric(5,2) NOT NULL,
            "allows_supplementary" boolean NOT NULL DEFAULT false,
            "repetition_policy" character varying(20) NOT NULL,
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_promotion_rules_policy" CHECK ("repetition_policy" IN ('NOT_APPLICABLE','FAMILY_REQUEST','BY_GRADE')),
            CONSTRAINT "PK_promotion_rules" PRIMARY KEY ("institution_id", "level_code"),
            CONSTRAINT "FK_promotion_rules_institution" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_promotion_rules_level" FOREIGN KEY ("level_code") REFERENCES "education_levels"("code")
        )`);

        // ── Datos iniciales ────────────────────────────────────────────────
        await queryRunner.query(
            `INSERT INTO "institutions" ("id","name") VALUES ($1, 'Institución educativa')`,
            [this.INSTITUTION_ID],
        );

        await queryRunner.query(`INSERT INTO "education_levels"
            ("code","name","level_group","sort_order","evaluation_mode","allows_supplementary") VALUES
            ('INICIAL','Educación Inicial','INICIAL',1,'QUALITATIVE',false),
            ('EGB_PREPARATORIA','EGB Preparatoria','EGB',2,'QUALITATIVE',false),
            ('EGB_ELEMENTAL','EGB Elemental','EGB',3,'QUALITATIVE',false),
            ('EGB_MEDIA','EGB Media','EGB',4,'MIXED',true),
            ('EGB_SUPERIOR','EGB Superior','EGB',5,'MIXED',true),
            ('BGU','Bachillerato General Unificado','BACHILLERATO',6,'MIXED',true),
            ('BACHILLERATO_TECNICO','Bachillerato Técnico','BACHILLERATO',7,'MIXED',true)`);

        await queryRunner.query(
            `INSERT INTO "institution_levels" ("institution_id","level_code","is_active","shifts")
             SELECT $1, "code", true, '["MATUTINA"]'::jsonb FROM "education_levels"`,
            [this.INSTITUTION_ID],
        );

        await queryRunner.query(
            `INSERT INTO "grading_scales" ("id","institution_id","name","min_value","max_value","passing_grade","decimals")
             VALUES ($1, $2, 'Escala MINEDUC 0-10', 0, 10, 7, 2)`,
            [this.SCALE_ID, this.INSTITUTION_ID],
        );

        // ⚠️ Rangos cualitativos a verificar contra el instructivo vigente.
        await queryRunner.query(`INSERT INTO "grading_scale_bands"
            ("id","scale_id","code","label","min_value","max_value","sort_order") VALUES
            (gen_random_uuid(), $1, 'NAAR', 'No alcanza los aprendizajes requeridos', 0.00, 4.00, 1),
            (gen_random_uuid(), $1, 'PAAR', 'Próximo a alcanzar los aprendizajes requeridos', 4.01, 6.99, 2),
            (gen_random_uuid(), $1, 'AAR', 'Alcanza los aprendizajes requeridos', 7.00, 8.99, 3),
            (gen_random_uuid(), $1, 'DAR', 'Domina los aprendizajes requeridos', 9.00, 10.00, 4)`,
            [this.SCALE_ID]);

        // ⚠️ Aplica desde EGB Superior (orden 5); sin plazo de justificación hasta confirmarlo.
        await queryRunner.query(
            `INSERT INTO "attendance_rules"
             ("institution_id","max_unjustified_pct","warning_pcts","applies_from_level_order","justification_days")
             VALUES ($1, 10, '[5, 8]', 5, NULL)`,
            [this.INSTITUTION_ID],
        );

        // ⚠️ Política de repetición por nivel a validar con el reglamento vigente.
        await queryRunner.query(
            `INSERT INTO "promotion_rules"
             ("institution_id","level_code","min_average","allows_supplementary","repetition_policy")
             SELECT $1, "code", 7, "allows_supplementary",
               CASE "code"
                 WHEN 'INICIAL' THEN 'NOT_APPLICABLE'
                 WHEN 'EGB_PREPARATORIA' THEN 'NOT_APPLICABLE'
                 WHEN 'EGB_ELEMENTAL' THEN 'FAMILY_REQUEST'
                 WHEN 'EGB_MEDIA' THEN 'FAMILY_REQUEST'
                 ELSE 'BY_GRADE'
               END
             FROM "education_levels"`,
            [this.INSTITUTION_ID],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "promotion_rules"`);
        await queryRunner.query(`DROP TABLE "attendance_rules"`);
        await queryRunner.query(`DROP TABLE "grading_scale_bands"`);
        await queryRunner.query(`DROP INDEX "uq_default_grading_scale"`);
        await queryRunner.query(`DROP TABLE "grading_scales"`);
        await queryRunner.query(`DROP TABLE "institution_levels"`);
        await queryRunner.query(`DROP TABLE "education_levels"`);
        await queryRunner.query(`DROP TABLE "institutions"`);
    }
}
