/**
 * One-off backfill: populates analytics_user_references,
 * analytics_subject_references and analytics_period_references with every
 * id already referenced by existing rows — BEFORE adding physical FKs
 * pointing at them, since `ALTER TABLE ... ADD CONSTRAINT` fails on any
 * existing row whose id isn't in the target table yet.
 *
 * Reuses the real IUserServiceClient.getProfile() and
 * IAcademicServiceClient.getSubjectDetails()/getPeriodDetails() (same HTTP
 * calls + upsert as normal runtime traffic) via a standalone Nest
 * application context — no duplicated JWT-signing or upsert logic.
 *
 * Run: pnpm backfill:reference-tables
 */
import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BackfillModule } from './backfill.module';
import { IUserServiceClient } from '../notifications/domain/ports/i-user-service.client';
import { IAcademicServiceClient } from '../domain/ports/i-academic-service.client';

const DISTINCT_USER_IDS_SQL = `
  SELECT DISTINCT id FROM (
    SELECT student_id AS id FROM student_metrics
    UNION SELECT student_id FROM student_subject_metrics
    UNION SELECT student_id FROM alerts
    UNION SELECT resolved_by FROM alerts WHERE resolved_by IS NOT NULL
    UNION SELECT user_id FROM device_tokens
    UNION SELECT recipient_id FROM notifications
    UNION SELECT student_id FROM notifications WHERE student_id IS NOT NULL
  ) referenced_ids
`;

const DISTINCT_SUBJECT_IDS_SQL = `
  SELECT DISTINCT id FROM (
    SELECT subject_id AS id FROM student_subject_metrics
    UNION SELECT subject_id FROM alerts WHERE subject_id IS NOT NULL
    UNION SELECT subject_id FROM notifications WHERE subject_id IS NOT NULL
  ) referenced_ids
`;

const DISTINCT_PERIOD_IDS_SQL = `
  SELECT DISTINCT id FROM (
    SELECT period_id AS id FROM student_metrics
    UNION SELECT period_id FROM student_subject_metrics
    UNION SELECT period_id FROM alerts WHERE period_id IS NOT NULL
    UNION SELECT period_id FROM notifications WHERE period_id IS NOT NULL
  ) referenced_ids
`;

async function backfill<T>(
  label: string,
  ids: { id: string }[],
  fetchAndSync: (id: string) => Promise<T | null>,
): Promise<void> {
  console.log(`[backfill] ${ids.length} distinct ${label} ids referenced in analytics-service`);
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
    const userClient = app.get<IUserServiceClient>('IUserServiceClient');
    const academicClient = app.get<IAcademicServiceClient>('IAcademicServiceClient');

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
