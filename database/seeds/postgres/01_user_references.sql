-- =====================================================
-- TABLAS DE REFERENCIA LOCAL DE USUARIO
-- academic_user_references, analytics_user_references,
-- prediction_user_references
--
-- Patron descrito en docs/database/entity-relationship-diagram.md §3: cada
-- servicio consumidor mantiene una copia minima (id, role, is_active) de
-- `auth-service.users`, llenada normalmente via upsert la primera vez que
-- ese servicio hace una llamada HTTP real a user-service. En un ambiente
-- sembrado desde cero no hay trafico real todavia, asi que este seed copia
-- directo desde `users` para que las FK RESTRICT que ya dependen de estas
-- tablas (subjects.teacher_id, enrollments.student_id, grades.student_id,
-- subject_teachers.teacher_id, weekly_check_ins.student_id, etc.) tengan
-- algo que referenciar. Debe correr antes de 05_subjects.sql (el primer
-- seed que inserta contra academic_user_references).
-- =====================================================

INSERT INTO academic_user_references (id, role, is_active, synced_at)
SELECT id, role, is_active, NOW() FROM users
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  synced_at = NOW();

DO $$
BEGIN
  IF to_regclass('public.analytics_user_references') IS NOT NULL THEN
    INSERT INTO analytics_user_references (id, role, is_active, synced_at)
    SELECT id, role, is_active, NOW() FROM users
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      synced_at = NOW();
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.prediction_user_references') IS NOT NULL THEN
    INSERT INTO prediction_user_references (id, role, is_active, synced_at)
    SELECT id, role, is_active, NOW() FROM users
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      synced_at = NOW();
  END IF;
END $$;
