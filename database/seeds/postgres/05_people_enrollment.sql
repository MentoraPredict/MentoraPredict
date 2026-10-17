-- =====================================================
-- PERSONAS Y MATRÍCULA
-- Ficha del estudiante, vínculo con representantes, consentimientos
-- (LOPDP) y matrícula por paralelo. Todos los datos son ficticios.
--
-- Estudiantes 001..048 se matriculan en 4 paralelos de 12 (8.º A, 8.º B,
-- 9.º A y 1.º BGU A); 049 y 050 quedan sin matrícula para probar el
-- flujo de matriculación desde Secretaría.
-- Cada representante (01..25) tiene dos representados: 2g-1 y 2g.
-- =====================================================

-- Tabla temporal de la sesión: psql ejecuta cada sentencia en su propia
-- transacción, así que no puede usar ON COMMIT DROP.
DROP TABLE IF EXISTS seed_students;
CREATE TEMP TABLE seed_students AS
SELECT
    u.id AS student_id,
    right(u.id::text, 3)::int AS n
FROM users u
WHERE u.role = 'STUDENT'
  AND u.id::text LIKE 'cccccccc-0000-4000-8000-000000000%';

-- Fichas ----------------------------------------------------------------

INSERT INTO student_profiles (
    student_id, birth_date, sex, nationality, address,
    has_special_needs, special_needs_notes,
    emergency_contact_name, emergency_contact_phone, previous_school, updated_at
)
SELECT
    ss.student_id,
    make_date(
        CASE WHEN ss.n <= 24 THEN 2013 WHEN ss.n <= 36 THEN 2012 ELSE 2010 END,
        1 + (ss.n % 12),
        1 + (ss.n % 27)
    ),
    CASE WHEN ss.n % 2 = 0 THEN 'F' ELSE 'M' END,
    'Ecuatoriana',
    'Quito, sector ' || (1 + (ss.n % 9)),
    ss.n IN (7, 19),
    CASE WHEN ss.n IN (7, 19) THEN 'Requiere adaptación curricular (dato de ejemplo).' ELSE NULL END,
    'Contacto de emergencia ' || ss.n,
    '099' || lpad((1000000 + ss.n)::text, 7, '0'),
    CASE WHEN ss.n % 5 = 0 THEN 'Unidad Educativa Municipal' ELSE NULL END,
    NOW()
FROM seed_students ss
ON CONFLICT (student_id) DO UPDATE SET
    birth_date = EXCLUDED.birth_date,
    sex = EXCLUDED.sex,
    nationality = EXCLUDED.nationality,
    address = EXCLUDED.address,
    has_special_needs = EXCLUDED.has_special_needs,
    special_needs_notes = EXCLUDED.special_needs_notes,
    emergency_contact_name = EXCLUDED.emergency_contact_name,
    emergency_contact_phone = EXCLUDED.emergency_contact_phone,
    previous_school = EXCLUDED.previous_school,
    updated_at = NOW();

-- Representantes ---------------------------------------------------------

INSERT INTO guardian_students (guardian_id, student_id, relation, is_primary, can_pickup, lives_with, created_at)
SELECT
    ('dddddddd-0000-4000-8000-0000000000' || lpad(((ss.n + 1) / 2)::text, 2, '0'))::uuid,
    ss.student_id,
    CASE WHEN ((ss.n + 1) / 2) % 2 = 1 THEN 'MOTHER' ELSE 'FATHER' END,
    TRUE,
    TRUE,
    TRUE,
    NOW()
FROM seed_students ss
WHERE ss.n BETWEEN 1 AND 50
ON CONFLICT (guardian_id, student_id) DO UPDATE SET
    relation = EXCLUDED.relation,
    is_primary = EXCLUDED.is_primary,
    can_pickup = EXCLUDED.can_pickup,
    lives_with = EXCLUDED.lives_with;

-- Consentimientos (tratamiento de datos para 1..40; análisis con IA para 1..20)

INSERT INTO consents (id, student_id, guardian_id, purpose, notice_version, granted_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    student_id, guardian_id, purpose, 'aviso-demo-v1', NOW()
FROM (
    SELECT
        ss.student_id,
        ('dddddddd-0000-4000-8000-0000000000' || lpad(((ss.n + 1) / 2)::text, 2, '0'))::uuid AS guardian_id,
        p.purpose,
        md5('consent:' || ss.student_id::text || ':' || p.purpose) AS h
    FROM seed_students ss
    JOIN (VALUES ('DATA_PROCESSING', 40), ('AI_ANALYSIS', 20)) AS p(purpose, max_n)
      ON ss.n <= p.max_n
) c
ON CONFLICT (id) DO NOTHING;

-- Matrícula por paralelo -------------------------------------------------

INSERT INTO student_enrollments (
    id, student_id, section_id, school_year_id, status, enrolled_at, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    student_id,
    ('e0000000-2026-4000-8000-00000000000' || section_no::text)::uuid,
    'a0000000-2026-4000-8000-000000000001',
    'ACTIVE',
    TIMESTAMPTZ '2026-09-01 08:00:00-05',
    NOW(), NOW()
FROM (
    SELECT
        ss.student_id,
        ((ss.n - 1) / 12) + 1 AS section_no,
        md5('student-enrollment:' || ss.student_id::text) AS h
    FROM seed_students ss
    WHERE ss.n BETWEEN 1 AND 48
) m
ON CONFLICT (id) DO UPDATE SET
    section_id = EXCLUDED.section_id,
    school_year_id = EXCLUDED.school_year_id,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Matrícula por asignatura: cada estudiante entra a los cursos de su paralelo.

INSERT INTO enrollments (id, student_id, subject_id, period_id, status, enrolled_at, created_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    se.student_id,
    sj.id,
    sj.academic_period_id,
    'ACTIVE',
    se.enrolled_at,
    NOW()
FROM student_enrollments se
JOIN subjects sj ON sj.section_id = se.section_id
CROSS JOIN LATERAL (SELECT md5('enrollment:' || se.student_id::text || ':' || sj.id::text) AS h) x(h)
WHERE se.status = 'ACTIVE'
  AND se.school_year_id = 'a0000000-2026-4000-8000-000000000001'
ON CONFLICT (student_id, subject_id, period_id) DO UPDATE SET
    status = EXCLUDED.status;
