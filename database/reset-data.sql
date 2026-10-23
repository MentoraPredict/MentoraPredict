-- =====================================================
-- LIMPIEZA DE DATOS (solo desarrollo y QA)
-- Vacía todas las tablas de datos para volver a cargar los seeds desde cero,
-- sin recrear el volumen de Postgres ni repetir las migraciones.
--
-- NO borra: las tablas de migraciones ni la configuración que crean las
-- migraciones (institución, niveles, escala de notas, reglas de asistencia y
-- promoción, grados y componentes de calificación).
-- SÍ borra todo lo demás: usuarios, matrículas, notas, asistencia, alertas,
-- el historial de seeds, etc. Incluye lo creado desde la aplicación.
--
-- Uso:
--   Get-Content database/reset-data.sql -Raw | docker @dc exec -T postgres `
--     psql -U mp_user -d mentorapredict -v ON_ERROR_STOP=1
--   docker @dc up --force-recreate seed-loader
-- =====================================================

DO $$
DECLARE
    keep TEXT[] := ARRAY[
        'institutions', 'education_levels', 'institution_levels',
        'grading_scales', 'grading_scale_bands', 'attendance_rules',
        'promotion_rules', 'grade_levels', 'grading_components'
    ];
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT LIKE 'migrations%'
          AND NOT (tablename = ANY (keep))
    LOOP
        EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', r.tablename);
    END LOOP;
END $$;
