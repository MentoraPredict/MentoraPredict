-- =====================================================
-- ACTIVIDADES Y NOTAS DEL PRIMER TRIMESTRE
-- Escala 0-10. Cada curso tiene 3 actividades formativas y 1 sumativa;
-- los pesos de los componentes (70/30) salen de `grading_components`,
-- por eso el peso individual de la actividad es 0.
--
-- Las notas son deterministas y salen del perfil de cada estudiante (tabla
-- seed_student_archetypes de 05_people_enrollment.sql): destacados, en riesgo,
-- en recuperación o en declive. El estudiante en riesgo crítico no rindió la
-- prueba del trimestre, para ver un periodo incompleto.
-- =====================================================

INSERT INTO evaluations (
    id, name, weight, subject_id, due_date, is_active,
    period_id, component_code, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    a.name,
    0,
    sj.id,
    a.due_date,
    TRUE,
    'a0000000-2026-4000-8000-0000000000b1',
    a.component_code,
    NOW(), NOW()
FROM subjects sj
CROSS JOIN (VALUES
    ('Tarea 1',              'FORMATIVE', TIMESTAMPTZ '2026-09-25 12:00:00-05'),
    ('Lección oral',         'FORMATIVE', TIMESTAMPTZ '2026-10-02 12:00:00-05'),
    ('Trabajo en clase',     'FORMATIVE', TIMESTAMPTZ '2026-10-09 12:00:00-05'),
    ('Prueba del trimestre', 'SUMMATIVE', TIMESTAMPTZ '2026-10-14 12:00:00-05')
) AS a(name, component_code, due_date)
CROSS JOIN LATERAL (SELECT md5('evaluation:' || sj.id::text || ':' || a.name) AS h) x(h)
WHERE sj.section_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    due_date = EXCLUDED.due_date,
    period_id = EXCLUDED.period_id,
    component_code = EXCLUDED.component_code,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO grades (
    id, student_id, subject_id, evaluation_id, value,
    registered_by, registered_at, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    student_id,
    subject_id,
    evaluation_id,
    value,
    teacher_id,
    due_date + interval '1 day',
    NOW(), NOW()
FROM (
    SELECT
        en.student_id,
        en.subject_id,
        ev.id AS evaluation_id,
        sj.teacher_id,
        ev.due_date,
        md5('grade:' || en.student_id::text || ':' || ev.id::text) AS h,
        -- Nota = media del perfil + tendencia a lo largo de las 4 evaluaciones
        -- + un pequeño efecto de la asignatura + ruido repetible.
        ROUND(
            LEAST(10, GREATEST(0,
                a.grade_mean
                + a.grade_trend * (
                    CASE ev.name
                        WHEN 'Tarea 1' THEN 1
                        WHEN 'Lección oral' THEN 2
                        WHEN 'Trabajo en clase' THEN 3
                        ELSE 4
                    END - 2.5)
                + ((('x' || substr(md5(en.subject_id::text), 1, 4))::bit(16)::int % 7) - 3) / 10.0
                + ((('x' || substr(md5('grade:' || en.student_id::text || ':' || ev.id::text), 1, 4))::bit(16)::int % 9) - 4) / 10.0
            ))::numeric,
            2
        ) AS value,
        (ev.name = 'Prueba del trimestre' AND a.skips_summative) AS skipped
    FROM enrollments en
    JOIN seed_student_profile_map pm ON pm.student_no = right(en.student_id::text, 3)::int
    JOIN seed_student_archetypes a ON a.code = pm.archetype
    JOIN subjects sj ON sj.id = en.subject_id AND sj.section_id IS NOT NULL
    JOIN evaluations ev ON ev.subject_id = en.subject_id
                       AND ev.period_id = 'a0000000-2026-4000-8000-0000000000b1'
    WHERE en.status = 'ACTIVE'
      AND en.period_id = 'a0000000-2026-4000-8000-0000000000b1'
) g
WHERE teacher_id IS NOT NULL
  -- El estudiante en riesgo crítico no rindió la prueba del trimestre.
  AND NOT skipped
ON CONFLICT (id) DO UPDATE SET
    value = EXCLUDED.value,
    registered_by = EXCLUDED.registered_by,
    registered_at = EXCLUDED.registered_at,
    updated_at = NOW();