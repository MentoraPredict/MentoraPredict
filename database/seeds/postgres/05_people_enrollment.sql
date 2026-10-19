-- =====================================================
-- PERSONAS Y MATRÍCULA
-- Ficha del estudiante, encuesta socioeconómica (DECE), vínculo con los
-- representantes, consentimientos (LOPDP) y matrícula por paralelo.
-- Todos los datos son ficticios.
--
-- Estudiantes 001..012 → 8.º A · 013..024 → 1.º BGU A.
-- 025 queda sin matrícula (flujo de matriculación de Secretaría) y 026 figura
-- como trasladado a otra institución.
--
-- Cada estudiante tiene un PERFIL (tabla seed_student_archetypes): de él
-- salen, de forma coherente, sus notas (06), su asistencia (07), su
-- actividad semanal (09) y sus ingresos a la plataforma (10). Así un
-- estudiante en riesgo lo es en todo: notas, faltas, entrega de tareas,
-- ánimo y uso de la plataforma.
-- =====================================================

-- Perfiles de rendimiento -------------------------------------------------
-- Tabla de apoyo solo del seed (no la usa la aplicación).
--   grade_mean / grade_trend : nota media y cambio por evaluación (0-10)
--   absent_pct               : % de clases a las que falta
--   compliance               : % de tareas entregadas
--   study_hours              : horas de estudio por semana
--   emotional                : 1 CRITICAL · 2 BAD · 3 NEUTRAL · 4 GOOD · 5 GREAT
--   comprehension            : % de comprensión de los temas
--   weekly_logins            : ingresos a la plataforma por semana
--   days_since_login         : días desde el último ingreso
--   skips_summative          : no rindió la prueba del trimestre

CREATE TABLE IF NOT EXISTS seed_student_archetypes (
    code             varchar(30) PRIMARY KEY,
    description      text NOT NULL,
    grade_mean       numeric(4,2) NOT NULL,
    grade_trend      numeric(4,2) NOT NULL,
    absent_pct       int NOT NULL,
    compliance       int NOT NULL,
    study_hours      numeric(4,1) NOT NULL,
    emotional        int NOT NULL,
    comprehension    int NOT NULL,
    weekly_logins    numeric(3,1) NOT NULL,
    days_since_login int NOT NULL,
    skips_summative  boolean NOT NULL DEFAULT false
);

INSERT INTO seed_student_archetypes VALUES
    ('DESTACADO',         'Notas altas, casi sin faltas, entrega todo',        9.30,  0.00,  2, 95, 7.0, 5, 90, 5.0, 0, false),
    ('ESTABLE',           'Buen rendimiento y constancia',                      8.20,  0.00,  4, 86, 5.0, 4, 76, 4.0, 0, false),
    ('REGULAR',           'Rendimiento justo, a veces entrega tarde',           7.20,  0.00,  8, 74, 4.0, 3, 64, 3.0, 1, false),
    ('RIESGO_ACADEMICO',  'Notas bajo el mínimo y poca entrega de tareas',      5.50,  0.00, 10, 55, 2.0, 2, 46, 2.0, 2, false),
    ('RIESGO_CRITICO',    'Notas muy bajas, muchas faltas, casi sin ingresar',  4.40, -0.30, 35, 22, 1.0, 1, 25, 1.0, 24, true),
    ('FALTAS_FRECUENTES', 'Buenas notas pero falta con frecuencia',             7.50,  0.00, 22, 68, 3.0, 3, 62, 3.0, 1, false),
    ('RECUPERACION',      'Empezó mal y mejora evaluación a evaluación',        6.00,  0.80,  6, 72, 5.0, 3, 60, 4.0, 0, false),
    ('DECLIVE',           'Empezó bien y va bajando',                           8.60, -0.70,  9, 62, 3.0, 2, 55, 2.0, 3, false)
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    grade_mean = EXCLUDED.grade_mean,
    grade_trend = EXCLUDED.grade_trend,
    absent_pct = EXCLUDED.absent_pct,
    compliance = EXCLUDED.compliance,
    study_hours = EXCLUDED.study_hours,
    emotional = EXCLUDED.emotional,
    comprehension = EXCLUDED.comprehension,
    weekly_logins = EXCLUDED.weekly_logins,
    days_since_login = EXCLUDED.days_since_login,
    skips_summative = EXCLUDED.skips_summative;

-- Estudiante → perfil. Cada paralelo tiene 12: 2 destacados, 3 estables,
-- 2 regulares, 1 en riesgo académico, 1 en riesgo crítico, 1 con faltas
-- frecuentes, 1 en recuperación y 1 en declive.

CREATE TABLE IF NOT EXISTS seed_student_profile_map (
    student_no  int PRIMARY KEY,
    archetype   varchar(30) REFERENCES seed_student_archetypes(code)
);

INSERT INTO seed_student_profile_map (student_no, archetype)
SELECT n, CASE ((n - 1) % 12) + 1
        WHEN 1 THEN 'DESTACADO'  WHEN 2 THEN 'DESTACADO'
        WHEN 3 THEN 'ESTABLE'    WHEN 4 THEN 'ESTABLE'    WHEN 5 THEN 'ESTABLE'
        WHEN 6 THEN 'REGULAR'    WHEN 7 THEN 'REGULAR'
        WHEN 8 THEN 'RIESGO_ACADEMICO'
        WHEN 9 THEN 'RIESGO_CRITICO'
        WHEN 10 THEN 'FALTAS_FRECUENTES'
        WHEN 11 THEN 'RECUPERACION'
        ELSE 'DECLIVE'
    END
FROM generate_series(1, 24) AS n
ON CONFLICT (student_no) DO UPDATE SET archetype = EXCLUDED.archetype;

-- Fichas ----------------------------------------------------------------
-- (nombre, sexo, nacimiento, sector, contacto de emergencia, datos de salud)

INSERT INTO student_profiles (
    student_id, birth_date, sex, nationality, address,
    has_special_needs, special_needs_notes,
    emergency_contact_name, emergency_contact_phone, previous_school, updated_at,
    document_type, phone, blood_type, allergies,
    disability_type, disability_percentage, conadis_card
)
SELECT
    ('cccccccc-0000-4000-8000-000000000' || lpad(p.n::text, 3, '0'))::uuid,
    p.birth_date::date, p.sex, 'Ecuatoriana', p.address,
    p.disability_type IS NOT NULL,
    p.special_needs_notes,
    p.emergency_name, p.emergency_phone, p.previous_school, NOW(),
    'CEDULA', p.phone, p.blood_type, p.allergies,
    p.disability_type, p.disability_pct, p.conadis_card
FROM (VALUES
    ( 1, '2013-03-14', 'F', 'Quito, Carapungo',        'Marcela Castillo',  '0992200301', NULL,                       '0981000001', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    ( 2, '2013-07-02', 'M', 'Quito, Cotocollao',       'Jorge Villacrés',   '0992200302', NULL,                       '0981000002', 'A+',  NULL,                NULL,      NULL, NULL, NULL),
    ( 3, '2013-11-21', 'F', 'Quito, Comité del Pueblo','Lucía Pazmiño',     '0992200303', 'Unidad Educativa Municipal','0981000003', 'O+',  'Polen',             NULL,      NULL, NULL, NULL),
    ( 4, '2012-05-09', 'M', 'Quito, Comité del Pueblo','Lucía Pazmiño',     '0992200303', 'Unidad Educativa Municipal','0981000004', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    ( 5, '2013-01-30', 'F', 'Quito, Guamaní',          'Andrés López',      '0992200304', NULL,                       '0981000005', 'B+',  NULL,                NULL,      NULL, NULL, NULL),
    ( 6, '2013-09-18', 'M', 'Quito, Chimbacalle',      'Sandra Martínez',   '0992200305', NULL,                       '0981000006', 'A-',  NULL,                'Intelectual',  'Requiere adaptación curricular de grado 1 en Matemática y Lengua.', 30, 'CNDS-17-0006'),
    ( 7, '2013-04-25', 'F', 'Quito, San Carlos',       'Miguel García',     '0992200306', NULL,                       '0981000007', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    ( 8, '2012-12-03', 'M', 'Quito, La Ecuatoriana',   'Diana Rodríguez',   '0992200307', NULL,                       '0981000008', 'AB+', NULL,                NULL,      NULL, NULL, NULL),
    ( 9, '2013-06-12', 'F', 'Quito, La Ecuatoriana',   'Diana Rodríguez',   '0992200307', NULL,                       '0981000009', 'AB+', 'Lactosa',           NULL,      NULL, NULL, NULL),
    (10, '2013-02-08', 'M', 'Quito, Turubamba',        'Luis Ramírez',      '0992200308', 'Unidad Educativa Fiscomisional', '0981000010', 'O-', NULL,             NULL,      NULL, NULL, NULL),
    (11, '2012-10-27', 'F', 'Quito, Conocoto',         'Carolina Ortega',   '0992200309', NULL,                       '0981000011', 'A+',  NULL,                NULL,      NULL, NULL, NULL),
    (12, '2013-08-15', 'M', 'Quito, Conocoto',         'Carolina Ortega',   '0992200309', NULL,                       '0981000012', 'A+',  'Penicilina',        NULL,      NULL, NULL, NULL),
    (13, '2011-03-04', 'F', 'Quito, Carapungo',        'Marcela Castillo',  '0992200301', NULL,                       '0981000013', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    (14, '2011-09-19', 'M', 'Quito, Pomasqui',         'Pablo Vega',        '0992200310', NULL,                       '0981000014', 'B-',  NULL,                NULL,      NULL, NULL, NULL),
    (15, '2011-05-22', 'F', 'Quito, Chimbacalle',      'Sandra Martínez',   '0992200305', NULL,                       '0981000015', 'A-',  NULL,                NULL,      NULL, NULL, NULL),
    (16, '2010-12-11', 'M', 'Quito, Pomasqui',         'Pablo Vega',        '0992200310', 'Colegio Particular San José','0981000016', 'B-', NULL,                 NULL,      NULL, NULL, NULL),
    (17, '2011-02-16', 'F', 'Quito, Tumbaco',          'Mónica Rojas',      '0992200311', NULL,                       '0981000017', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    (18, '2010-10-05', 'M', 'Quito, Tumbaco',          'Mónica Rojas',      '0992200311', NULL,                       '0981000018', 'O+',  NULL,                'Visual',  'Baja visión: requiere ubicarse en las primeras filas y material ampliado.', 40, 'CNDS-17-0018'),
    (19, '2011-07-28', 'F', 'Quito, Calderón',         'Javier Pérez',      '0992200312', NULL,                       '0981000019', 'A+',  NULL,                NULL,      NULL, NULL, NULL),
    (20, '2011-01-13', 'M', 'Quito, Calderón',         'Javier Pérez',      '0992200312', NULL,                       '0981000020', 'A+',  'Frutos secos',      NULL,      NULL, NULL, NULL),
    (21, '2010-11-30', 'F', 'Quito, Calderón',         'Javier Pérez',      '0992200312', 'Unidad Educativa Municipal','0981000021', 'A+',  NULL,                NULL,      NULL, NULL, NULL),
    (22, '2011-04-07', 'M', 'Quito, El Inca',          'Ana Salazar',       '0992200313', NULL,                       '0981000022', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    (23, '2011-08-24', 'F', 'Quito, El Inca',          'Ana Salazar',       '0992200313', NULL,                       '0981000023', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    (24, '2010-09-14', 'M', 'Quito, El Inca',          'Ana Salazar',       '0992200313', NULL,                       '0981000024', 'O+',  NULL,                NULL,      NULL, NULL, NULL),
    (25, '2013-05-06', 'F', 'Quito, Cotocollao',       'Jorge Villacrés',   '0992200302', 'Escuela Particular Santa Ana', '0981000025', 'A+', NULL,              NULL,      NULL, NULL, NULL),
    (26, '2013-10-02', 'M', 'Quito, Guamaní',          'Andrés López',      '0992200304', NULL,                       '0981000026', 'B+',  NULL,                NULL,      NULL, NULL, NULL)
) AS p(n, birth_date, sex, address, emergency_name, emergency_phone, previous_school, phone, blood_type, allergies,
       disability_type, special_needs_notes, disability_pct, conadis_card)
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
    document_type = EXCLUDED.document_type,
    phone = EXCLUDED.phone,
    blood_type = EXCLUDED.blood_type,
    allergies = EXCLUDED.allergies,
    disability_type = EXCLUDED.disability_type,
    disability_percentage = EXCLUDED.disability_percentage,
    conadis_card = EXCLUDED.conadis_card,
    updated_at = NOW();

-- Encuesta socioeconómica (la ve solo el DECE) ----------------------------
-- Se aplicó a los estudiantes matriculados de 8.º A y a los de riesgo de
-- 1.º BGU A; el resto queda pendiente para que el DECE la complete.

INSERT INTO student_socioeconomic_surveys (
    student_id, household_members, monthly_income_range, student_works,
    transport_mode, commute_minutes, guardian_education_level, housing_type,
    has_internet, has_computer, receives_government_aid, notes,
    surveyed_by, surveyed_at, updated_at
)
SELECT
    ('cccccccc-0000-4000-8000-000000000' || lpad(s.n::text, 3, '0'))::uuid,
    s.members, s.income, s.works, s.transport, s.commute, s.education, s.housing,
    s.internet, s.computer, s.aid, s.notes,
    'ffffffff-0000-4000-8000-000000000001', TIMESTAMPTZ '2026-09-14 10:00:00-05', NOW()
FROM (VALUES
    ( 1, 4, '2_TO_4_SBU',  false, 'BUS',  35, 'HIGHER',    'OWNED',    true,  true,  false, NULL),
    ( 2, 5, '1_TO_2_SBU',  false, 'BUS',  40, 'SECONDARY', 'RENTED',   true,  true,  false, NULL),
    ( 3, 4, '2_TO_4_SBU',  false, 'WALK', 15, 'HIGHER',    'OWNED',    true,  true,  false, NULL),
    ( 4, 4, '2_TO_4_SBU',  false, 'WALK', 15, 'HIGHER',    'OWNED',    true,  true,  false, NULL),
    ( 5, 6, 'BELOW_1_SBU', false, 'BUS',  60, 'PRIMARY',   'RENTED',   false, false, true,  'Familia numerosa; sin internet en casa.'),
    ( 6, 5, '1_TO_2_SBU',  false, 'BUS',  45, 'SECONDARY', 'OWNED',    true,  false, false, NULL),
    ( 7, 3, 'ABOVE_4_SBU', false, 'CAR',  20, 'HIGHER',    'OWNED',    true,  true,  false, NULL),
    ( 8, 5, '1_TO_2_SBU',  false, 'BUS',  50, 'SECONDARY', 'RENTED',   true,  false, false, NULL),
    ( 9, 5, '1_TO_2_SBU',  false, 'BUS',  50, 'SECONDARY', 'RENTED',   true,  false, false, NULL),
    (10, 7, 'BELOW_1_SBU', true,  'BUS',  75, 'PRIMARY',   'BORROWED', false, false, true,  'Ayuda en el negocio familiar por las tardes.'),
    (11, 4, '2_TO_4_SBU',  false, 'BUS',  40, 'SECONDARY', 'OWNED',    true,  true,  false, NULL),
    (12, 4, '2_TO_4_SBU',  false, 'BUS',  40, 'SECONDARY', 'OWNED',    true,  true,  false, NULL),
    (21, 6, 'BELOW_1_SBU', true,  'BUS',  70, 'PRIMARY',   'RENTED',   false, false, true,  'Trabaja los fines de semana. Riesgo de abandono por motivos económicos.'),
    (24, 6, 'BELOW_1_SBU', true,  'BIKE', 55, 'PRIMARY',   'RENTED',   false, false, true,  'Repartidor en bicicleta; llega cansado a clases.')
) AS s(n, members, income, works, transport, commute, education, housing, internet, computer, aid, notes)
ON CONFLICT (student_id) DO UPDATE SET
    household_members = EXCLUDED.household_members,
    monthly_income_range = EXCLUDED.monthly_income_range,
    student_works = EXCLUDED.student_works,
    transport_mode = EXCLUDED.transport_mode,
    commute_minutes = EXCLUDED.commute_minutes,
    guardian_education_level = EXCLUDED.guardian_education_level,
    housing_type = EXCLUDED.housing_type,
    has_internet = EXCLUDED.has_internet,
    has_computer = EXCLUDED.has_computer,
    receives_government_aid = EXCLUDED.receives_government_aid,
    notes = EXCLUDED.notes,
    surveyed_by = EXCLUDED.surveyed_by,
    surveyed_at = EXCLUDED.surveyed_at,
    updated_at = NOW();

-- Representantes ---------------------------------------------------------
-- 13 representantes: uno con hijos en grados distintos (01: 001 y 013),
-- dos con tres hijos (12 y 13) y varios con un solo hijo.

INSERT INTO guardian_students (guardian_id, student_id, relation, is_primary, can_pickup, lives_with, created_at)
SELECT
    ('dddddddd-0000-4000-8000-0000000000' || lpad(l.g::text, 2, '0'))::uuid,
    ('cccccccc-0000-4000-8000-000000000' || lpad(l.n::text, 3, '0'))::uuid,
    l.relation, TRUE, TRUE, TRUE, NOW()
FROM (VALUES
    ( 1,  1, 'MOTHER'), ( 1, 13, 'MOTHER'),
    ( 2,  2, 'FATHER'), ( 2, 25, 'FATHER'),
    ( 3,  3, 'MOTHER'), ( 3,  4, 'MOTHER'),
    ( 4,  5, 'FATHER'), ( 4, 26, 'FATHER'),
    ( 5,  6, 'MOTHER'), ( 5, 15, 'MOTHER'),
    ( 6,  7, 'FATHER'),
    ( 7,  8, 'MOTHER'), ( 7,  9, 'MOTHER'),
    ( 8, 10, 'FATHER'),
    ( 9, 11, 'MOTHER'), ( 9, 12, 'MOTHER'),
    (10, 14, 'FATHER'), (10, 16, 'FATHER'),
    (11, 17, 'MOTHER'), (11, 18, 'MOTHER'),
    (12, 19, 'FATHER'), (12, 20, 'FATHER'), (12, 21, 'FATHER'),
    (13, 22, 'MOTHER'), (13, 23, 'MOTHER'), (13, 24, 'MOTHER')
) AS l(g, n, relation)
ON CONFLICT (guardian_id, student_id) DO UPDATE SET
    relation = EXCLUDED.relation,
    is_primary = EXCLUDED.is_primary,
    can_pickup = EXCLUDED.can_pickup,
    lives_with = EXCLUDED.lives_with;

-- Consentimientos ----------------------------------------------------------
-- Tratamiento de datos: todos los matriculados salvo 024 (pendiente).
-- Análisis con IA: solo 8.º A (001..012); en 009 el representante lo revocó.

INSERT INTO consents (id, student_id, guardian_id, purpose, notice_version, granted_at, revoked_at)
SELECT
    (substr(c.h, 1, 8) || '-' || substr(c.h, 9, 4) || '-4' || substr(c.h, 14, 3) || '-8' || substr(c.h, 18, 3) || '-' || substr(c.h, 21, 12))::uuid,
    c.student_id, gs.guardian_id, c.purpose, 'aviso-demo-v1',
    TIMESTAMPTZ '2026-09-02 09:00:00-05',
    CASE WHEN c.n = 9 AND c.purpose = 'AI_ANALYSIS' THEN TIMESTAMPTZ '2026-10-05 16:30:00-05' ELSE NULL END
FROM (
    SELECT
        right(u.id::text, 3)::int AS n,
        u.id AS student_id,
        p.purpose,
        md5('consent:' || u.id::text || ':' || p.purpose) AS h
    FROM users u
    JOIN (VALUES ('DATA_PROCESSING', 1, 23), ('AI_ANALYSIS', 1, 12)) AS p(purpose, min_n, max_n)
      ON right(u.id::text, 3)::int BETWEEN p.min_n AND p.max_n
    WHERE u.role = 'STUDENT'
) c
JOIN guardian_students gs ON gs.student_id = c.student_id AND gs.is_primary
ON CONFLICT (id) DO UPDATE SET
    revoked_at = EXCLUDED.revoked_at;

-- Matrícula por paralelo -------------------------------------------------

INSERT INTO student_enrollments (
    id, student_id, section_id, school_year_id, status, enrolled_at, ended_at, notes, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    ('cccccccc-0000-4000-8000-000000000' || lpad(m.n::text, 3, '0'))::uuid,
    CASE WHEN m.n <= 12 OR m.n = 26 THEN 'e0000000-2026-4000-8000-000000000001' ELSE 'e0000000-2026-4000-8000-000000000002' END::uuid,
    'a0000000-2026-4000-8000-000000000001',
    CASE WHEN m.n = 26 THEN 'TRANSFERRED' ELSE 'ACTIVE' END,
    TIMESTAMPTZ '2026-09-01 08:00:00-05',
    CASE WHEN m.n = 26 THEN TIMESTAMPTZ '2026-09-28 11:00:00-05' ELSE NULL END,
    CASE WHEN m.n = 26 THEN 'Traslado a otra institución por cambio de domicilio (dato de ejemplo).' ELSE NULL END,
    NOW(), NOW()
FROM (SELECT g AS n FROM generate_series(1, 24) g UNION ALL SELECT 26) m
CROSS JOIN LATERAL (
    SELECT md5('student-enrollment:cccccccc-0000-4000-8000-000000000' || lpad(m.n::text, 3, '0')) AS h
) x(h)
ON CONFLICT (id) DO UPDATE SET
    section_id = EXCLUDED.section_id,
    school_year_id = EXCLUDED.school_year_id,
    status = EXCLUDED.status,
    ended_at = EXCLUDED.ended_at,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Matrícula por asignatura: cada estudiante activo entra a los cursos de su paralelo.

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
