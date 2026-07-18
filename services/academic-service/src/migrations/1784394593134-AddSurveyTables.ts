import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSurveyTables1784394593134 implements MigrationInterface {
    name = 'AddSurveyTables1784394593134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "survey_questions" ("id" uuid NOT NULL, "code" character varying(50) NOT NULL, "category" character varying(50) NOT NULL, "question_text" text NOT NULL, "question_type" character varying(20) NOT NULL, "options" jsonb, "is_active" boolean NOT NULL DEFAULT true, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_3be637438964b9d52775a8617bf" UNIQUE ("code"), CONSTRAINT "CHK_survey_questions_question_type" CHECK ("question_type" IN ('SINGLE_CHOICE','MULTI_CHOICE','NUMBER','TEXT','BOOLEAN')), CONSTRAINT "PK_131815624efb0f0e15a220102de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey_responses" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "period_id" uuid NOT NULL, "survey_code" character varying(50) NOT NULL, "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_349995c51959d139d8e485a58ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey_answers" ("id" uuid NOT NULL, "response_id" uuid NOT NULL, "question_id" uuid NOT NULL, "answer_value" jsonb NOT NULL, CONSTRAINT "UQ_survey_answers_response_question" UNIQUE ("response_id", "question_id"), CONSTRAINT "PK_e4cab112318f766c93435f77a1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "survey_responses" ADD CONSTRAINT "FK_survey_responses_student_id" FOREIGN KEY ("student_id") REFERENCES "academic_user_references"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey_responses" ADD CONSTRAINT "FK_survey_responses_period_id" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey_answers" ADD CONSTRAINT "FK_survey_answers_response_id" FOREIGN KEY ("response_id") REFERENCES "survey_responses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey_answers" ADD CONSTRAINT "FK_survey_answers_question_id" FOREIGN KEY ("question_id") REFERENCES "survey_questions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey_answers" DROP CONSTRAINT "FK_survey_answers_question_id"`);
        await queryRunner.query(`ALTER TABLE "survey_answers" DROP CONSTRAINT "FK_survey_answers_response_id"`);
        await queryRunner.query(`ALTER TABLE "survey_responses" DROP CONSTRAINT "FK_survey_responses_period_id"`);
        await queryRunner.query(`ALTER TABLE "survey_responses" DROP CONSTRAINT "FK_survey_responses_student_id"`);
        await queryRunner.query(`DROP TABLE "survey_answers"`);
        await queryRunner.query(`DROP TABLE "survey_responses"`);
        await queryRunner.query(`DROP TABLE "survey_questions"`);
    }

}
