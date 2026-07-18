import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserReferences1784323068646 implements MigrationInterface {
    name = 'AddUserReferences1784323068646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_references" ("id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_active" boolean NOT NULL, "synced_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0a7e184c07fc1802dec3359e2c7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_references"`);
    }

}
