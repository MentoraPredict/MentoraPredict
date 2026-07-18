import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * `user_references` collided with the same generic name planned for
 * analytics-service and prediction-service's own local reference tables —
 * all 5 services share one physical Postgres database, so an unprefixed
 * name means every service's TypeORM entity resolves to the SAME table.
 * Renaming to a service-prefixed name here, matching the convention used
 * for migrationsTableName (migrations_academic, migrations_analytics, ...).
 * Postgres FK constraints track the referenced table by OID, not name, so
 * the 12 existing FKs pointing at this table are unaffected by the rename.
 */
export class RenameUserReferencesTable1784326581789 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_references" RENAME TO "academic_user_references"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "academic_user_references" RENAME TO "user_references"`);
    }

}
