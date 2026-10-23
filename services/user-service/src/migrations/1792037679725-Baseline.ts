import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1792037679725 implements MigrationInterface {
    name = 'Baseline1792037679725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_profiles" ("id" uuid NOT NULL, "photo" character varying, "bio" text, "cedula" character varying, "avatar_url" character varying(500), "auth_provider" character varying NOT NULL DEFAULT 'LOCAL', "role" character varying NOT NULL DEFAULT 'STUDENT', "status" character varying NOT NULL DEFAULT 'ACTIVE', "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee58e49a8745879bc805477140a" UNIQUE ("cedula"), CONSTRAINT "CHK_user_profiles_status" CHECK ("status" IN ('ACTIVE','INACTIVE')), CONSTRAINT "CHK_user_profiles_auth_provider" CHECK ("auth_provider" IN ('LOCAL','MICROSOFT')), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_profiles"`);
    }

}
