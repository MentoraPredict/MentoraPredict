-- =====================================================
-- HORARIOS, CLASES Y ASISTENCIA
-- Cada curso tiene tantos bloques semanales como horas (máximo 5). Las
-- clases se generan para todo el año lectivo; las anteriores a hoy quedan
-- HELD con la asistencia registrada por el docente, las demás PLANNED.
--
-- Hay estudiantes con ausencias frecuentes (n múltiplo de 7: ~25 %;
-- múltiplo de 11: ~12 %; resto: ~3 %) para probar los avisos de
-- Configuración → Asistencia, y algunas faltas con justificación
-- pendiente, aprobada o rechazada. Los festivos no se descuentan.
-- =====================================================

-- Bloques semanales -------------------------------------------------------

INSERT INTO class_schedules (id, subject_id, day_of_week, start_time, end_time, created_at, updated_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    c.subject_id,
    (ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'])[((c.k + j.j) % 5) + 1],
    TIME '07:00' + (c.k * interval '1 hour'),
    TIME '07:45' + (c.k * interval '1 hour'),
    NOW(), NOW()
FROM (
    SELECT
        sj.id AS subject_id,
        LEAST(COALESCE(sj.weekly_hours, 1), 5) AS blocks,
        (row_number() OVER (PARTITION BY sj.section_id ORDER BY sj.subject_catalog_id) - 1)::int AS k
    FROM subjects sj
    WHERE sj.section_id IS NOT NULL
) c
CROSS JOIN LATERAL generate_series(0, c.blocks - 1) AS j(j)
CROSS JOIN LATERAL (
    SELECT md5('schedule:' || c.subject_id::text || ':' || ((c.k + j.j) % 5)::text) AS h
) x(h)
ON CONFLICT (id) DO UPDATE SET
    day_of_week = EXCLUDED.day_of_week,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    updated_at = NOW();

-- Clases del año lectivo --------------------------------------------------

INSERT INTO class_sessions (
    id, subject_id, schedule_id, session_date, academic_week, academic_year,
    status, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    cs.subject_id,
    cs.id,
    d.d::date,
    EXTRACT(WEEK FROM d.d)::int,
    EXTRACT(YEAR FROM d.d)::int,
    CASE WHEN d.d::date < current_date THEN 'HELD' ELSE 'PLANNED' END,
    NOW(), NOW()
FROM class_schedules cs
JOIN subjects sj ON sj.id = cs.subject_id AND sj.section_id IS NOT NULL
JOIN sections sec ON sec.id = sj.section_id
JOIN school_years sy ON sy.id = sec.school_year_id
CROSS JOIN LATERAL generate_series(sy.start_date::timestamp, sy.end_date::timestamp, interval '1 day') AS d(d)
CROSS JOIN LATERAL (
    SELECT md5('session:' || cs.id::text || ':' || d.d::date::text) AS h
) x(h)
WHERE EXTRACT(ISODOW FROM d.d)::int = CASE cs.day_of_week
        WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3
        WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 ELSE 0 END
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

-- Asistencia registrada por el docente --------------------------------------

INSERT INTO session_attendances (id, session_id, student_id, present, recorded_by, recorded_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    s.session_id,
    s.student_id,
    s.roll >= s.absent_pct,
    'TEACHER',
    (s.session_date + s.start_time + interval '50 minutes')::timestamptz
FROM (
    SELECT
        ses.id AS session_id,
        ses.session_date,
        cs.start_time,
        en.student_id,
        md5('attendance:' || ses.id::text || ':' || en.student_id::text) AS h,
        (('x' || substr(md5('roll:' || ses.id::text || ':' || en.student_id::text), 1, 4))::bit(16)::int % 100) AS roll,
        CASE
            WHEN (right(en.student_id::text, 3)::int) % 7 = 0 THEN 25
            WHEN (right(en.student_id::text, 3)::int) % 11 = 0 THEN 12
            ELSE 3
        END AS absent_pct
    FROM class_sessions ses
    JOIN class_schedules cs ON cs.id = ses.schedule_id
    JOIN enrollments en ON en.subject_id = ses.subject_id AND en.status = 'ACTIVE'
    WHERE ses.status = 'HELD'
) s
ON CONFLICT (session_id, student_id) DO UPDATE SET
    present = EXCLUDED.present,
    recorded_by = EXCLUDED.recorded_by,
    recorded_at = EXCLUDED.recorded_at;

-- Justificaciones de algunas faltas ---------------------------------------

INSERT INTO absence_justifications (
    id, session_id, student_id, requested_by, reason, status,
    resolved_by, resolved_at, resolution_note, created_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    session_id,
    student_id,
    guardian_id,
    'Cita médica (dato de ejemplo).',
    status,
    CASE WHEN status = 'PENDING' THEN NULL ELSE '99999999-0000-4000-8000-000000000001'::uuid END,
    CASE WHEN status = 'PENDING' THEN NULL ELSE session_date + interval '2 days' END,
    CASE status
        WHEN 'APPROVED' THEN 'Certificado médico presentado (dato de ejemplo).'
        WHEN 'REJECTED' THEN 'No se adjuntó documento de respaldo (dato de ejemplo).'
        ELSE NULL
    END,
    session_date + interval '1 day'
FROM (
    SELECT
        sa.session_id,
        sa.student_id,
        ses.session_date,
        ('dddddddd-0000-4000-8000-0000000000'
            || lpad((((right(sa.student_id::text, 3)::int) + 1) / 2)::text, 2, '0'))::uuid AS guardian_id,
        md5('justification:' || sa.session_id::text || ':' || sa.student_id::text) AS h,
        CASE (('x' || substr(md5('status:' || sa.session_id::text || ':' || sa.student_id::text), 1, 4))::bit(16)::int % 3)
            WHEN 0 THEN 'PENDING'
            WHEN 1 THEN 'APPROVED'
            ELSE 'REJECTED'
        END AS status
    FROM session_attendances sa
    JOIN class_sessions ses ON ses.id = sa.session_id
    WHERE sa.present = FALSE
      AND (('x' || substr(md5('wants:' || sa.session_id::text || ':' || sa.student_id::text), 1, 4))::bit(16)::int % 5) = 0
) j
ON CONFLICT (id) DO NOTHING;
