/**
 * One-off backfill: populates `user_references` with every user id already
 * referenced by existing rows (subjects.teacher_id, enrollments.student_id,
 * grades.student_id/registered_by, grade_history.changed_by,
 * subject_teachers.teacher_id, grade_imports.imported_by,
 * weekly_check_ins.student_id) — BEFORE adding physical FKs pointing at
 * user_references, since `ALTER TABLE ... ADD CONSTRAINT` fails on any
 * existing row whose id isn't in the target table yet.
 *
 * Reuses the real UserProfileAdapter (same HTTP call + upsert as normal
 * runtime traffic) via a standalone Nest application context — no
 * duplicated JWT-signing or upsert logic.
 *
 * Run: pnpm backfill:user-references
 */
import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { IUserProfilePort } from '../application/ports/output/i-user-profile.port';

const DISTINCT_USER_IDS_SQL = `
  SELECT DISTINCT id FROM (
    SELECT teacher_id AS id FROM subjects WHERE teacher_id IS NOT NULL
    UNION SELECT student_id FROM enrollments
    UNION SELECT student_id FROM grades
    UNION SELECT registered_by FROM grades
    UNION SELECT changed_by FROM grade_history
    UNION SELECT teacher_id FROM subject_teachers
    UNION SELECT imported_by FROM grade_imports
    UNION SELECT student_id FROM weekly_check_ins
  ) referenced_ids
`;

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    const rows: { id: string }[] = await dataSource.query(DISTINCT_USER_IDS_SQL);

    console.log(`[backfill] ${rows.length} distinct user ids referenced in academic-service`);

    const adapter = app.get<IUserProfilePort>('IUserProfilePort');
    let ok = 0;
    let failed = 0;

    for (const { id } of rows) {
      const profile = await adapter.getProfile(id);
      if (profile) {
        ok++;
      } else {
        failed++;
        console.warn(`[backfill] could not fetch/sync profile for ${id}`);
      }
    }

    console.log(`[backfill] done — synced ${ok}, failed ${failed}`);
    if (failed > 0) {
      console.error(
        `[backfill] ${failed} id(s) could not be synced — adding FK constraints ` +
          'would fail for any row referencing them. Investigate before proceeding to Fase 4c.',
      );
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[backfill] fatal error', err);
  process.exit(1);
});
