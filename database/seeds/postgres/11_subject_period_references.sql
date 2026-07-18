-- =====================================================
-- TABLAS DE REFERENCIA LOCAL DE MATERIA/PERIODO
-- analytics_subject_references, analytics_period_references,
-- prediction_subject_references, prediction_period_references
--
-- Mismo patron y mismo motivo que 01_user_references.sql (ver ese archivo),
-- aplicado a `subjects`/`academic_periods` en vez de `users`. Corre despues
-- de 05_subjects.sql y de 04_academicPeriods.sql (ambas tablas ya existen a
-- esta altura) y antes de 12_student_analytics.sql, el seed que inserta
-- contra estas tablas via FK RESTRICT (student_subject_metrics,
-- student_subject_predictions).
-- =====================================================

DO $$
BEGIN
  IF to_regclass('public.analytics_subject_references') IS NOT NULL THEN
    INSERT INTO analytics_subject_references (id, is_active, synced_at)
    SELECT id, is_active, NOW() FROM subjects
    ON CONFLICT (id) DO UPDATE SET
      is_active = EXCLUDED.is_active,
      synced_at = NOW();
  END IF;

  IF to_regclass('public.analytics_period_references') IS NOT NULL THEN
    INSERT INTO analytics_period_references (id, status, synced_at)
    SELECT id, status, NOW() FROM academic_periods
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      synced_at = NOW();
  END IF;

  IF to_regclass('public.prediction_subject_references') IS NOT NULL THEN
    INSERT INTO prediction_subject_references (id, is_active, synced_at)
    SELECT id, is_active, NOW() FROM subjects
    ON CONFLICT (id) DO UPDATE SET
      is_active = EXCLUDED.is_active,
      synced_at = NOW();
  END IF;

  IF to_regclass('public.prediction_period_references') IS NOT NULL THEN
    INSERT INTO prediction_period_references (id, status, synced_at)
    SELECT id, status, NOW() FROM academic_periods
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      synced_at = NOW();
  END IF;
END $$;
