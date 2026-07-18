import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckConstraints1784341277967 implements MigrationInterface {
    name = 'AddCheckConstraints1784341277967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "CHK_user_profiles_status" CHECK ("status" IN ('ACTIVE','INACTIVE'))`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "CHK_user_profiles_auth_provider" CHECK ("auth_provider" IN ('LOCAL','MICROSOFT'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "CHK_user_profiles_auth_provider"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "CHK_user_profiles_status"`);
    }

}
