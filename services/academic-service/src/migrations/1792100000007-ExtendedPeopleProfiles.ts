import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Datos de personas que faltaban para la ficha del estudiante y el DECE:
 *  - salud y discapacidad en `student_profiles`;
 *  - encuesta socioeconómica (`student_socioeconomic_surveys`), que solo el
 *    DECE debe poder ver: alimenta el factor socioeconómico del riesgo de
 *    deserción;
 *  - contacto y datos profesionales de docentes, representantes y personal
 *    (`user_contact_details`), porque `user_profiles` no guarda teléfono.
 */
export class ExtendedPeopleProfiles1792100000007 implements MigrationInterface {
    name = 'ExtendedPeopleProfiles1792100000007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_profiles"
            ADD COLUMN "document_type" character varying(20) NOT NULL DEFAULT 'CEDULA',
            ADD COLUMN "phone" character varying(30),
            ADD COLUMN "blood_type" character varying(3),
            ADD COLUMN "allergies" text,
            ADD COLUMN "disability_type" character varying(30),
            ADD COLUMN "disability_percentage" smallint,
            ADD COLUMN "conadis_card" character varying(20),
            ADD CONSTRAINT "CHK_student_profiles_document_type" CHECK ("document_type" IN ('CEDULA','PASAPORTE','OTRO')),
            ADD CONSTRAINT "CHK_student_profiles_blood_type" CHECK ("blood_type" IS NULL OR "blood_type" IN ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
            ADD CONSTRAINT "CHK_student_profiles_disability_pct" CHECK ("disability_percentage" IS NULL OR "disability_percentage" BETWEEN 0 AND 100)`);

        await queryRunner.query(`CREATE TABLE "student_socioeconomic_surveys" (
            "student_id" uuid NOT NULL,
            "household_members" smallint,
            "monthly_income_range" character varying(20),
            "student_works" boolean NOT NULL DEFAULT false,
            "transport_mode" character varying(20),
            "commute_minutes" smallint,
            "guardian_education_level" character varying(20),
            "housing_type" character varying(20),
            "has_internet" boolean NOT NULL DEFAULT false,
            "has_computer" boolean NOT NULL DEFAULT false,
            "receives_government_aid" boolean NOT NULL DEFAULT false,
            "notes" text,
            "surveyed_by" uuid,
            "surveyed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "CHK_socioeconomic_income" CHECK ("monthly_income_range" IS NULL OR "monthly_income_range" IN ('BELOW_1_SBU','1_TO_2_SBU','2_TO_4_SBU','ABOVE_4_SBU')),
            CONSTRAINT "CHK_socioeconomic_transport" CHECK ("transport_mode" IS NULL OR "transport_mode" IN ('WALK','BUS','CAR','BIKE','OTHER')),
            CONSTRAINT "CHK_socioeconomic_education" CHECK ("guardian_education_level" IS NULL OR "guardian_education_level" IN ('NONE','PRIMARY','SECONDARY','HIGHER')),
            CONSTRAINT "CHK_socioeconomic_housing" CHECK ("housing_type" IS NULL OR "housing_type" IN ('OWNED','RENTED','BORROWED')),
            CONSTRAINT "PK_student_socioeconomic_surveys" PRIMARY KEY ("student_id")
        )`);

        await queryRunner.query(`CREATE TABLE "user_contact_details" (
            "user_id" uuid NOT NULL,
            "phone" character varying(30),
            "alternate_phone" character varying(30),
            "address" character varying(300),
            "occupation" character varying(120),
            "specialty" character varying(120),
            "academic_title" character varying(200),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_user_contact_details" PRIMARY KEY ("user_id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_contact_details"`);
        await queryRunner.query(`DROP TABLE "student_socioeconomic_surveys"`);
        await queryRunner.query(`ALTER TABLE "student_profiles"
            DROP CONSTRAINT "CHK_student_profiles_disability_pct",
            DROP CONSTRAINT "CHK_student_profiles_blood_type",
            DROP CONSTRAINT "CHK_student_profiles_document_type",
            DROP COLUMN "conadis_card",
            DROP COLUMN "disability_percentage",
            DROP COLUMN "disability_type",
            DROP COLUMN "allergies",
            DROP COLUMN "blood_type",
            DROP COLUMN "phone",
            DROP COLUMN "document_type"`);
    }
}
