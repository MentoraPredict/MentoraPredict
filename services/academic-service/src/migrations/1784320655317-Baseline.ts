import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline1784320655317 implements MigrationInterface {
    name = 'Baseline1784320655317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "faculties" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(20) NOT NULL, "description" text NOT NULL DEFAULT '', "status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE ("name"), CONSTRAINT "UQ_f1b2cd43a96c6fb75c8ad44de88" UNIQUE ("code"), CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "careers" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(20) NOT NULL, "description" text NOT NULL DEFAULT '', "status" character varying(20) NOT NULL DEFAULT 'ACTIVE', "faculty_id" uuid NOT NULL, "duration_semesters" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee40b65408fc3927faa74d478a8" UNIQUE ("code"), CONSTRAINT "PK_febfc45dc83d58090d3122fde3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "academic_periods" ("id" uuid NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(20) NOT NULL, "description" text NOT NULL DEFAULT '', "start_date" date NOT NULL, "end_date" date NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PLANNED', "type" character varying NOT NULL DEFAULT 'SEMESTER', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c2d04cba0473190a799da160271" UNIQUE ("name"), CONSTRAINT "UQ_51e51a2c82740735cff0bdf6b0d" UNIQUE ("code"), CONSTRAINT "PK_911f414fba24e3855a5ba1f51ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_one_active_period" ON "academic_periods"  ("status") WHERE status = 'ACTIVE'`);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "description" text NOT NULL DEFAULT '', "code" character varying(20) NOT NULL, "credits" integer NOT NULL, "career_id" uuid NOT NULL, "academic_period_id" uuid NOT NULL, "max_capacity" integer NOT NULL DEFAULT '30', "teacher_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "image_url" character varying(500), CONSTRAINT "UQ_542cbba74dde3c82ab49c573109" UNIQUE ("code"), CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evaluations" ("id" uuid NOT NULL, "name" character varying(200) NOT NULL, "weight" numeric(5,2) NOT NULL, "subject_id" uuid NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "enrolled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grades" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "evaluation_id" uuid, "value" numeric(4,2) NOT NULL, "registered_by" uuid NOT NULL, "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grade_history" ("id" uuid NOT NULL, "grade_id" uuid NOT NULL, "previous_value" numeric(4,2) NOT NULL, "new_value" numeric(4,2) NOT NULL, "changed_by" uuid NOT NULL, "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e40a1b4d7c0c09958c4094565f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subject_teachers" ("subject_id" uuid NOT NULL, "teacher_id" uuid NOT NULL, "period_id" uuid NOT NULL, CONSTRAINT "PK_b3e77e2059b0c200fe4336c5d8a" PRIMARY KEY ("subject_id", "teacher_id", "period_id"))`);
        await queryRunner.query(`CREATE TABLE "grade_imports" ("id" uuid NOT NULL, "subject_id" uuid NOT NULL, "imported_by" uuid NOT NULL, "file_name" character varying(500) NOT NULL, "file_size" integer NOT NULL, "total_rows" integer NOT NULL DEFAULT '0', "created_rows" integer NOT NULL DEFAULT '0', "updated_rows" integer NOT NULL DEFAULT '0', "unchanged_rows" integer NOT NULL DEFAULT '0', "failed_rows" integer NOT NULL DEFAULT '0', "status" character varying(30) NOT NULL, "errors" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_617c448c873d826e260f4b40f6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "topics" ("id" uuid NOT NULL, "subject_id" uuid NOT NULL, "title" character varying(200) NOT NULL, "description" text, "order" integer NOT NULL, "file_url" character varying(500), "original_file_name" character varying(255), "file_size" integer, "mime_type" character varying(150), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_topic_subject_order" ON "topics"  ("subject_id", "order") `);
        await queryRunner.query(`CREATE TABLE "weekly_check_ins" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "subject_id" uuid NOT NULL, "period_id" uuid NOT NULL, "academic_week" integer NOT NULL, "academic_year" integer NOT NULL, "check_in_date" date NOT NULL, "attendance" integer NOT NULL DEFAULT '0', "task_completion" integer NOT NULL, "study_hours" numeric(5,2) NOT NULL, "emotional_state" character varying(20) NOT NULL, "general_comprehension" integer NOT NULL, "topic_responses" jsonb NOT NULL DEFAULT '[]', "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_47716f265aca69dd682388de340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_check_in_student_subject_week" ON "weekly_check_ins"  ("student_id", "subject_id", "academic_week", "academic_year") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_check_in_student_subject_week"`);
        await queryRunner.query(`DROP TABLE "weekly_check_ins"`);
        await queryRunner.query(`DROP INDEX "public"."idx_topic_subject_order"`);
        await queryRunner.query(`DROP TABLE "topics"`);
        await queryRunner.query(`DROP TABLE "grade_imports"`);
        await queryRunner.query(`DROP TABLE "subject_teachers"`);
        await queryRunner.query(`DROP TABLE "grade_history"`);
        await queryRunner.query(`DROP TABLE "grades"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TABLE "evaluations"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP INDEX "public"."uq_one_active_period"`);
        await queryRunner.query(`DROP TABLE "academic_periods"`);
        await queryRunner.query(`DROP TABLE "careers"`);
        await queryRunner.query(`DROP TABLE "faculties"`);
    }

}
