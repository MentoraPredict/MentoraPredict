import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Año lectivo (MINEDUC) como padre de los periodos de calificación.
 * `academic_periods` se conserva: ahora representa trimestres/quimestres
 * y se vincula a `school_years`.
 */
export class SchoolYears1792100000000 implements MigrationInterface {
    name = 'SchoolYears1792100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "school_years" (
            "id" uuid NOT NULL,
            "name" character varying(100) NOT NULL,
            "code" character varying(20) NOT NULL,
            "regime" character varying(20) NOT NULL DEFAULT 'SIERRA_AMAZONIA',
            "period_scheme" character varying(20) NOT NULL DEFAULT 'TRIMESTER',
            "periods_count" integer NOT NULL DEFAULT 3,
            "start_date" date NOT NULL,
            "end_date" date NOT NULL,
            "min_class_days" integer NOT NULL DEFAULT 200,
            "recovery_start_date" date,
            "recovery_end_date" date,
            "supplementary_start_date" date,
            "supplementary_end_date" date,
            "status" character varying(20) NOT NULL DEFAULT 'PLANNED',
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_school_years_name" UNIQUE ("name"),
            CONSTRAINT "UQ_school_years_code" UNIQUE ("code"),
            CONSTRAINT "CHK_school_years_status" CHECK ("status" IN ('PLANNED','ACTIVE','FINISHED')),
            CONSTRAINT "CHK_school_years_regime" CHECK ("regime" IN ('SIERRA_AMAZONIA','COSTA_GALAPAGOS')),
            CONSTRAINT "CHK_school_years_scheme" CHECK ("period_scheme" IN ('TRIMESTER','QUIMESTER','SEMESTER')),
            CONSTRAINT "CHK_school_years_dates" CHECK ("start_date" < "end_date"),
            CONSTRAINT "PK_school_years" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_one_active_school_year" ON "school_years" ("status") WHERE status = 'ACTIVE'`);

        await queryRunner.query(`ALTER TABLE "academic_periods" ADD "school_year_id" uuid`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD "period_number" integer`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD "grades_due_date" date`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD CONSTRAINT "FK_academic_periods_school_year" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`CREATE INDEX "idx_academic_periods_school_year" ON "academic_periods" ("school_year_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_academic_periods_year_number" ON "academic_periods" ("school_year_id", "period_number") WHERE "school_year_id" IS NOT NULL`);

        await queryRunner.query(`ALTER TABLE "academic_periods" DROP CONSTRAINT "CHK_academic_periods_type"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD CONSTRAINT "CHK_academic_periods_type" CHECK ("type" IN ('SEMESTER','QUARTER','TRIMESTER','QUIMESTER'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP CONSTRAINT "CHK_academic_periods_type"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" ADD CONSTRAINT "CHK_academic_periods_type" CHECK ("type" IN ('SEMESTER','QUARTER'))`);
        await queryRunner.query(`DROP INDEX "uq_academic_periods_year_number"`);
        await queryRunner.query(`DROP INDEX "idx_academic_periods_school_year"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP CONSTRAINT "FK_academic_periods_school_year"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP COLUMN "grades_due_date"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP COLUMN "period_number"`);
        await queryRunner.query(`ALTER TABLE "academic_periods" DROP COLUMN "school_year_id"`);
        await queryRunner.query(`DROP INDEX "uq_one_active_school_year"`);
        await queryRunner.query(`DROP TABLE "school_years"`);
    }
}
