import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Requires the reference-table backfill (backfill-reference-tables.ts) to
 * have run first — otherwise this fails on the first pre-existing row in
 * student_subject_predictions whose student_id/subject_id/period_id isn't
 * mirrored yet. See docs/database/entity-relationship-diagram.md §3/§4.5.
 */
export class AddForeignKeysAndChecks1784340104044 implements MigrationInterface {
    name = 'AddForeignKeysAndChecks1784340104044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "CHK_student_subject_predictions_risk_level" CHECK ("predicted_risk_level" IS NULL OR "predicted_risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL'))`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "CHK_student_subject_predictions_status" CHECK ("status" IN ('COMPUTED','INSUFFICIENT_DATA'))`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_student_id" FOREIGN KEY ("student_id") REFERENCES "prediction_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_subject_id" FOREIGN KEY ("subject_id") REFERENCES "prediction_subject_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" ADD CONSTRAINT "FK_student_subject_predictions_period_id" FOREIGN KEY ("period_id") REFERENCES "prediction_period_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_period_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_subject_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "FK_student_subject_predictions_student_id"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "CHK_student_subject_predictions_status"`);
        await queryRunner.query(`ALTER TABLE "student_subject_predictions" DROP CONSTRAINT "CHK_student_subject_predictions_risk_level"`);
    }

}
