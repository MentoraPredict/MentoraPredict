import { MigrationInterface, QueryRunner } from "typeorm";

/** Agrega los roles DECE (consejería estudiantil) e INSPECTOR. */
export class AddDeceInspectorRoles1792100000101 implements MigrationInterface {
    name = 'AddDeceInspectorRoles1792100000101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN','GUARDIAN','SECRETARY','DECE','INSPECTOR'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "users" SET "role" = 'STUDENT' WHERE "role" IN ('DECE','INSPECTOR')`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN','GUARDIAN','SECRETARY'))`);
    }
}
