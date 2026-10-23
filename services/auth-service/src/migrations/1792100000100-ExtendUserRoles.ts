import { MigrationInterface, QueryRunner } from "typeorm";

/** Agrega los roles GUARDIAN (representante) y SECRETARY (secretaría). */
export class ExtendUserRoles1792100000100 implements MigrationInterface {
    name = 'ExtendUserRoles1792100000100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN','GUARDIAN','SECRETARY'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "users" SET "role" = 'STUDENT' WHERE "role" IN ('GUARDIAN','SECRETARY')`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN'))`);
    }
}
