import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginEvents1784395890561 implements MigrationInterface {
    name = 'AddLoginEvents1784395890561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "login_events" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "login_method" character varying(20) NOT NULL, "ip_address" character varying(45), "user_agent" text, "device_type" character varying(20), CONSTRAINT "CHK_login_events_login_method" CHECK ("login_method" IN ('LOCAL','MICROSOFT')), CONSTRAINT "PK_5cd6102474db62bc181590b9902" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "login_events" ADD CONSTRAINT "FK_login_events_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_events" DROP CONSTRAINT "FK_login_events_user_id"`);
        await queryRunner.query(`DROP TABLE "login_events"`);
    }

}
