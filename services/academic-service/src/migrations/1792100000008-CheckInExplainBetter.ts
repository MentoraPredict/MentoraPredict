import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Registrar avance: texto libre con la parte de la materia que el estudiante
 * querría que se explique mejor. Va separado de `notes` (habilidades que
 * quiere reforzar) para que el docente pueda leerlo por su cuenta.
 */
export class CheckInExplainBetter1792100000008 implements MigrationInterface {
    name = 'CheckInExplainBetter1792100000008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD COLUMN "explain_better" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP COLUMN "explain_better"`);
    }
}
