import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckConstraints1784341196612 implements MigrationInterface {
    name = 'AddCheckConstraints1784341196612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_auth_provider" CHECK ("auth_provider" IN ('LOCAL','MICROSOFT'))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('STUDENT','TEACHER','ADMIN'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_auth_provider"`);
    }

}
