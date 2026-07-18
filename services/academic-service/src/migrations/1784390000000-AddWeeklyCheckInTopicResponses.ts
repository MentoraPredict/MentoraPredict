import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Fase C (docs/database/database-update-plan.md §5.3): normaliza
 * weekly_check_ins.topic_responses (jsonb, sin integridad referencial real)
 * en una tabla propia con FK real hacia `topics`.
 *
 * Los datos reales existentes (1586 respuestas en 528 check-ins) usan dos
 * formatos de `topicId` mezclados — verificado contra la base real antes de
 * escribir esta migración:
 * - 1581 filas: un entero como string (ej. "1") que en realidad es el campo
 *   `order` del tema dentro de su materia (bug/atajo del seed script) — se
 *   resuelve vía (subject_id, order) -> topics.id.
 * - 5 filas: ya un UUID real de `topics.id` (de un check-in creado a través
 *   del flujo real de la aplicación) — se castean directo.
 * Ambos casos verificados con 0 filas sin match antes de aplicar.
 */
export class AddWeeklyCheckInTopicResponses1784390000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "weekly_check_in_topic_responses" ("id" uuid NOT NULL, "check_in_id" uuid NOT NULL, "topic_id" uuid NOT NULL, "comprehension" integer NOT NULL, CONSTRAINT "UQ_weekly_check_in_topic_responses_checkin_topic" UNIQUE ("check_in_id", "topic_id"), CONSTRAINT "CHK_weekly_check_in_topic_responses_comprehension" CHECK ("comprehension" BETWEEN 0 AND 100), CONSTRAINT "PK_weekly_check_in_topic_responses" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "weekly_check_in_topic_responses" ADD CONSTRAINT "FK_weekly_check_in_topic_responses_check_in_id" FOREIGN KEY ("check_in_id") REFERENCES "weekly_check_ins"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "weekly_check_in_topic_responses" ADD CONSTRAINT "FK_weekly_check_in_topic_responses_topic_id" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT`);

        // Caso 1: topicId numérico (== topics.order dentro de la materia del check-in).
        await queryRunner.query(`
            INSERT INTO "weekly_check_in_topic_responses" ("id", "check_in_id", "topic_id", "comprehension")
            SELECT gen_random_uuid(), wci.id, t.id, (tr->>'comprehension')::int
            FROM "weekly_check_ins" wci
            CROSS JOIN LATERAL jsonb_array_elements(wci.topic_responses) tr
            JOIN "topics" t ON t.subject_id = wci.subject_id AND t."order" = (tr->>'topicId')::int
            WHERE tr->>'topicId' ~ '^[0-9]+$'
        `);

        // Caso 2: topicId ya es un UUID real de topics.id.
        await queryRunner.query(`
            INSERT INTO "weekly_check_in_topic_responses" ("id", "check_in_id", "topic_id", "comprehension")
            SELECT gen_random_uuid(), wci.id, (tr->>'topicId')::uuid, (tr->>'comprehension')::int
            FROM "weekly_check_ins" wci
            CROSS JOIN LATERAL jsonb_array_elements(wci.topic_responses) tr
            WHERE tr->>'topicId' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        `);

        await queryRunner.query(`ALTER TABLE "weekly_check_ins" DROP COLUMN "topic_responses"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weekly_check_ins" ADD "topic_responses" jsonb NOT NULL DEFAULT '[]'`);

        await queryRunner.query(`
            UPDATE "weekly_check_ins" wci
            SET "topic_responses" = agg.responses
            FROM (
                SELECT check_in_id, jsonb_agg(jsonb_build_object('topicId', topic_id, 'comprehension', comprehension)) AS responses
                FROM "weekly_check_in_topic_responses"
                GROUP BY check_in_id
            ) agg
            WHERE agg.check_in_id = wci.id
        `);

        await queryRunner.query(`ALTER TABLE "weekly_check_in_topic_responses" DROP CONSTRAINT "FK_weekly_check_in_topic_responses_topic_id"`);
        await queryRunner.query(`ALTER TABLE "weekly_check_in_topic_responses" DROP CONSTRAINT "FK_weekly_check_in_topic_responses_check_in_id"`);
        await queryRunner.query(`DROP TABLE "weekly_check_in_topic_responses"`);
    }

}
