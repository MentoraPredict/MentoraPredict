import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceTables1784340104043 implements MigrationInterface {
    name = 'AddReferenceTables1784340104043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "prediction_user_references" ("id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0995140e98052f5acc396cd7fb6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prediction_subject_references" ("id" uuid NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2fa3ab883716dee87a6e07f969a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prediction_period_references" ("id" uuid NOT NULL, "status" character varying(20) NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a518c424fe133b8b9ad4ced276a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "prediction_period_references"`);
        await queryRunner.query(`DROP TABLE "prediction_subject_references"`);
        await queryRunner.query(`DROP TABLE "prediction_user_references"`);
    }

}
