import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceTables1784327209463 implements MigrationInterface {
    name = 'AddReferenceTables1784327209463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "analytics_user_references" ("id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_455b7b3efe6332c764917247355" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_subject_references" ("id" uuid NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_1fc734d1ac3b765d917637691c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_period_references" ("id" uuid NOT NULL, "status" character varying(20) NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_19425871b2cf7711faf11f4b871" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "analytics_period_references"`);
        await queryRunner.query(`DROP TABLE "analytics_subject_references"`);
        await queryRunner.query(`DROP TABLE "analytics_user_references"`);
    }

}
