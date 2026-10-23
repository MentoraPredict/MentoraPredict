import { MigrationInterface, QueryRunner } from "typeorm";

export class AiSettings1792100000010 implements MigrationInterface {
    name = 'AiSettings1792100000010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_settings" ("id" smallint NOT NULL, "encrypted_api_key" text, "key_last4" character varying(8), "model" character varying(60), "enabled" boolean NOT NULL DEFAULT true, "updated_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_ai_settings_singleton" CHECK ("id" = 1), CONSTRAINT "PK_ai_settings" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_usage_logs" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "model" character varying(60) NOT NULL, "kind" character varying(20) NOT NULL, "success" boolean NOT NULL, "prompt_tokens" integer NOT NULL DEFAULT 0, "completion_tokens" integer NOT NULL DEFAULT 0, "total_tokens" integer NOT NULL DEFAULT 0, "duration_ms" integer NOT NULL DEFAULT 0, "error" character varying(300), CONSTRAINT "CHK_ai_usage_logs_kind" CHECK ("kind" IN ('recommendation','test')), CONSTRAINT "PK_ai_usage_logs" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_ai_usage_logs_created" ON "ai_usage_logs" ("created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_ai_usage_logs_created"`);
        await queryRunner.query(`DROP TABLE "ai_usage_logs"`);
        await queryRunner.query(`DROP TABLE "ai_settings"`);
    }
}