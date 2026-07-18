/**
 * One-off backfill: populates prediction_user_references,
 * prediction_subject_references and prediction_period_references with every
 * id already referenced by existing rows — BEFORE adding physical FKs
 * pointing at them, since `ALTER TABLE ... ADD CONSTRAINT` fails on any
 * existing row whose id isn't in the target table yet.
 *
 * Reuses the real IUserServiceClient.getProfile() and
 * IAcademicContextClient.getSubjectDetails()/getPeriodDetails() (same HTTP
 * calls + upsert as normal runtime traffic) via a standalone Nest
 * application context — no duplicated JWT-signing or upsert logic.
 *
 * Run: pnpm backfill:reference-tables
 */
import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BackfillModule } from './backfill.module';
import { IUserServiceClient } from '../application/ports/output/i-user-service.client';
import { IAcademicContextClient } from '../application/ports/output/i-academic-context.client';
import { USER_SERVICE_CLIENT } from '../application/use-cases/recalculate-subject-prediction.use-case';
import { ACADEMIC_CONTEXT_CLIENT } from '../application/use-cases/generate-prediction.use-case';

const DISTINCT_USER_IDS_SQL = `SELECT DISTINCT student_id AS id FROM student_subject_predictions`;
const DISTINCT_SUBJECT_IDS_SQL = `SELECT DISTINCT subject_id AS id FROM student_subject_predictions`;
const DISTINCT_PERIOD_IDS_SQL = `SELECT DISTINCT period_id AS id FROM student_subject_predictions`;

async function backfill<T>(
  label: string,
  ids: { id: string }[],
  fetchAndSync: (id: string) => Promise<T | null>,
): Promise<void> {
  console.log(`[backfill] ${ids.length} distinct ${label} ids referenced in prediction-service`);
  let ok = 0;
  let failed = 0;
  for (const { id } of ids) {
    const result = await fetchAndSync(id);
    if (result) ok++;
    else {
      failed++;
      console.warn(`[backfill] could not fetch/sync ${label} for ${id}`);
    }
  }
  console.log(`[backfill] ${label} done — synced ${ok}, failed ${failed}`);
  if (failed > 0) {
    console.error(
      `[backfill] ${failed} ${label} id(s) could not be synced — adding FK constraints ` +
        'would fail for any row referencing them. Investigate before proceeding to Fase 4c.',
    );
    process.exitCode = 1;
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(BackfillModule, {
    logger: ['warn', 'error'],
  });

  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    const userClient = app.get<IUserServiceClient>(USER_SERVICE_CLIENT);
    const academicClient = app.get<IAcademicContextClient>(ACADEMIC_CONTEXT_CLIENT);

    const userIds: { id: string }[] = await dataSource.query(DISTINCT_USER_IDS_SQL);
    const subjectIds: { id: string }[] = await dataSource.query(DISTINCT_SUBJECT_IDS_SQL);
    const periodIds: { id: string }[] = await dataSource.query(DISTINCT_PERIOD_IDS_SQL);

    await backfill('user', userIds, (id) => userClient.getProfile(id));
    await backfill('subject', subjectIds, (id) => academicClient.getSubjectDetails(id));
    await backfill('period', periodIds, (id) => academicClient.getPeriodDetails(id));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[backfill] fatal error', err);
  process.exit(1);
});
