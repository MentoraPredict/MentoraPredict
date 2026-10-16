import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1792037672414 implements MigrationInterface {
    name = 'Baseline1792037672414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying(255) NOT NULL, "password_hash" text, "role" character varying NOT NULL DEFAULT 'STUDENT', "auth_provider" character varying NOT NULL DEFAULT 'LOCAL', "is_active" boolean NOT NULL DEFAULT true, "is_verified" boolean NOT NULL DEFAULT false, "first_name" character varying(100) NOT NULL DEFAULT '', "last_name" character varying(100) NOT NULL DEFAULT '', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "CHK_users_auth_provider" CHECK ("auth_provider" IN ('LOCAL','MICROSOFT')), CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN')), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "login_events" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "login_method" character varying(20) NOT NULL, "ip_address" character varying(45), "user_agent" text, "device_type" character varying(20), CONSTRAINT "CHK_login_events_login_method" CHECK ("login_method" IN ('LOCAL','MICROSOFT')), CONSTRAINT "PK_5cd6102474db62bc181590b9902" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "login_events" ADD CONSTRAINT "FK_login_events_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_events" DROP CONSTRAINT "FK_login_events_user_id"`);
        await queryRunner.query(`DROP TABLE "login_events"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
