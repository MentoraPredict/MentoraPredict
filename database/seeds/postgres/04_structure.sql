-- =====================================================
-- ESTRUCTURA ACADÉMICA
-- Catálogo de asignaturas, malla por grado, paralelos y cursos
-- (una asignatura de un paralelo es una fila de `subjects` con section_id).
--
-- Los grados (`grade_levels`) los crea la migración; aquí solo se usan
-- 8.º EGB y 1.º BGU (la malla de 9.º queda definida para crear paralelos desde
-- el panel). Las horas semanales son valores de ejemplo:
-- la malla oficial se edita desde Grados y paralelos.
-- Debe correr después de 02_user_references.sql (tutores y docentes) y de
-- 03_school_year.sql.
-- =====================================================

-- Catálogo de asignaturas ------------------------------------------------

INSERT INTO subject_catalog (id, name, description, code, area, is_active, created_at, updated_at) VALUES
    ('d1000000-0000-4000-8000-000000000001', 'Matemática',                      'Álgebra, geometría y estadística',           'MAT', 'Matemática',                    TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000002', 'Lengua y Literatura',             'Comprensión lectora y producción de textos', 'LEN', 'Lengua y Literatura',           TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000003', 'Ciencias Naturales',              'Biología, física y química básicas',         'CNA', 'Ciencias Naturales',            TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000004', 'Estudios Sociales',               'Historia, geografía y ciudadanía',           'ESO', 'Ciencias Sociales',             TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000005', 'Inglés',                          'Lengua extranjera',                          'ING', 'Lengua Extranjera',             TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000006', 'Educación Física',                'Desarrollo motriz y salud',                  'EFI', 'Educación Física',              TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000007', 'Educación Cultural y Artística',  'Expresión artística y patrimonio cultural',  'ECA', 'Educación Cultural y Artística', TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000008', 'Física',                          'Mecánica, energía y ondas',                  'FIS', 'Ciencias Naturales',            TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-000000000009', 'Química',                         'Materia, reacciones y soluciones',           'QUI', 'Ciencias Naturales',            TRUE, NOW(), NOW()),
    ('d1000000-0000-4000-8000-00000000000a', 'Historia',                        'Historia del Ecuador y del mundo',           'HIS', 'Ciencias Sociales',             TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    code = EXCLUDED.code,
    area = EXCLUDED.area,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Malla curricular por grado ---------------------------------------------

INSERT INTO curriculum_subjects (grade_level_code, subject_catalog_id, weekly_hours) VALUES
    ('EGB_8', 'd1000000-0000-4000-8000-000000000001', 5),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000002', 5),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000003', 4),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000004', 4),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000005', 3),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000006', 3),
    ('EGB_8', 'd1000000-0000-4000-8000-000000000007', 2),

    ('EGB_9', 'd1000000-0000-4000-8000-000000000001', 5),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000002', 5),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000003', 4),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000004', 4),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000005', 3),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000006', 3),
    ('EGB_9', 'd1000000-0000-4000-8000-000000000007', 2),

    ('BGU_1', 'd1000000-0000-4000-8000-000000000001', 5),
    ('BGU_1', 'd1000000-0000-4000-8000-000000000002', 5),
    ('BGU_1', 'd1000000-0000-4000-8000-000000000008', 3),
    ('BGU_1', 'd1000000-0000-4000-8000-000000000009', 3),
    ('BGU_1', 'd1000000-0000-4000-8000-00000000000a', 3),
    ('BGU_1', 'd1000000-0000-4000-8000-000000000005', 3),
    ('BGU_1', 'd1000000-0000-4000-8000-000000000006', 2)
ON CONFLICT (grade_level_code, subject_catalog_id) DO UPDATE SET
    weekly_hours = EXCLUDED.weekly_hours;

-- Paralelos (tutores: Fernando Paredes en 8.º A, Verónica Cárdenas en 1.º BGU A) --

INSERT INTO sections (id, school_year_id, grade_level_code, name, shift, capacity, tutor_id, is_active, created_at, updated_at) VALUES
    ('e0000000-2026-4000-8000-000000000001', 'a0000000-2026-4000-8000-000000000001', 'EGB_8', 'A', 'MATUTINA', 35, 'bbbbbbbb-0000-4000-8000-000000000002', TRUE, NOW(), NOW()),
    ('e0000000-2026-4000-8000-000000000002', 'a0000000-2026-4000-8000-000000000001', 'BGU_1', 'A', 'MATUTINA', 40, 'bbbbbbbb-0000-4000-8000-000000000005', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    school_year_id = EXCLUDED.school_year_id,
    grade_level_code = EXCLUDED.grade_level_code,
    name = EXCLUDED.name,
    shift = EXCLUDED.shift,
    capacity = EXCLUDED.capacity,
    tutor_id = EXCLUDED.tutor_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Cursos: cada asignatura de la malla en cada paralelo -------------------------
-- El periodo "ancla" del curso es el trimestre en el que se crea (el primero).
-- Cada asignatura la dicta el mismo docente en los dos paralelos:
--   1 Matemática · 2 Lengua · 3 Ciencias Naturales y Física · 4 Química
--   5 Estudios Sociales e Historia · 6 Inglés · 7 Educación Física · 8 Arte

WITH teacher_by_subject (code, teacher_no) AS (
    VALUES ('MAT', 1), ('LEN', 2), ('CNA', 3), ('FIS', 3), ('QUI', 4),
           ('ESO', 5), ('HIS', 5), ('ING', 6), ('EFI', 7), ('ECA', 8)
),
offerings AS (
    SELECT
        s.id AS section_id,
        s.capacity,
        cs.subject_catalog_id,
        cs.weekly_hours,
        tbs.teacher_no,
        md5(s.id::text || ':' || cs.subject_catalog_id::text) AS h
    FROM sections s
    JOIN curriculum_subjects cs ON cs.grade_level_code = s.grade_level_code
    JOIN subject_catalog sc ON sc.id = cs.subject_catalog_id
    JOIN teacher_by_subject tbs ON tbs.code = sc.code
    WHERE s.school_year_id = 'a0000000-2026-4000-8000-000000000001'
)
INSERT INTO subjects (
    id, subject_catalog_id, academic_period_id, max_capacity, teacher_id,
    is_active, section_id, weekly_hours, created_at, updated_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    subject_catalog_id,
    'a0000000-2026-4000-8000-0000000000b1',
    capacity,
    ('bbbbbbbb-0000-4000-8000-0000000000' || lpad(teacher_no::text, 2, '0'))::uuid,
    TRUE,
    section_id,
    weekly_hours,
    NOW(), NOW()
FROM offerings
ON CONFLICT (id) DO UPDATE SET
    academic_period_id = EXCLUDED.academic_period_id,
    max_capacity = EXCLUDED.max_capacity,
    teacher_id = EXCLUDED.teacher_id,
    is_active = EXCLUDED.is_active,
    section_id = EXCLUDED.section_id,
    weekly_hours = EXCLUDED.weekly_hours,
    updated_at = NOW();

INSERT INTO subject_teachers (subject_id, teacher_id, period_id)
SELECT sj.id, sj.teacher_id, sj.academic_period_id
FROM subjects sj
WHERE sj.section_id IS NOT NULL
  AND sj.teacher_id IS NOT NULL
ON CONFLICT (subject_id, teacher_id, period_id) DO NOTHING;
-- Temario (3 unidades por asignatura) --------------------------------------

WITH topic_catalog (code, rn, title, description) AS (
    VALUES
        ('MAT', 1, 'Números enteros y racionales', 'Operaciones, propiedades y resolución de problemas.'),
        ('MAT', 2, 'Álgebra: expresiones y ecuaciones', 'Lenguaje algebraico y ecuaciones de primer grado.'),
        ('MAT', 3, 'Geometría y medida', 'Perímetros, áreas y teorema de Pitágoras.'),
        ('LEN', 1, 'Comprensión lectora', 'Estrategias para leer y analizar textos narrativos y expositivos.'),
        ('LEN', 2, 'Gramática y ortografía', 'Categorías gramaticales, concordancia y reglas ortográficas.'),
        ('LEN', 3, 'Producción de textos', 'Planificación y redacción de textos con coherencia y cohesión.'),
        ('CNA', 1, 'Los seres vivos y su entorno', 'Ecosistemas, cadenas alimenticias y biodiversidad.'),
        ('CNA', 2, 'Materia y energía', 'Estados de la materia, mezclas y transformaciones de la energía.'),
        ('CNA', 3, 'El cuerpo humano', 'Sistemas del cuerpo humano y hábitos saludables.'),
        ('ESO', 1, 'Ecuador: geografía y regiones', 'Regiones naturales, relieve y recursos del Ecuador.'),
        ('ESO', 2, 'Historia del Ecuador', 'Pueblos originarios, colonia e independencia.'),
        ('ESO', 3, 'Ciudadanía y derechos', 'Derechos, deberes y participación ciudadana.'),
        ('ING', 1, 'Present and past tenses', 'Uso del presente y pasado simple en situaciones cotidianas.'),
        ('ING', 2, 'Vocabulary in context', 'Vocabulario de la vida diaria, escuela y comunidad.'),
        ('ING', 3, 'Reading and writing', 'Lectura de textos breves y redacción de párrafos.'),
        ('EFI', 1, 'Condición física básica', 'Resistencia, fuerza, velocidad y flexibilidad.'),
        ('EFI', 2, 'Deportes colectivos', 'Reglas, fundamentos y juego en equipo.'),
        ('EFI', 3, 'Salud y hábitos', 'Higiene, alimentación y prevención de lesiones.'),
        ('ECA', 1, 'Expresión plástica', 'Color, forma y composición en obras propias.'),
        ('ECA', 2, 'Música y movimiento', 'Ritmo, melodía y expresión corporal.'),
        ('ECA', 3, 'Patrimonio cultural', 'Manifestaciones culturales del Ecuador.'),
        ('FIS', 1, 'Movimiento y fuerzas', 'Cinemática básica y leyes de Newton.'),
        ('FIS', 2, 'Trabajo y energía', 'Energía cinética, potencial y conservación.'),
        ('FIS', 3, 'Ondas y sonido', 'Características de las ondas y fenómenos sonoros.'),
        ('QUI', 1, 'Estructura de la materia', 'Átomos, elementos y tabla periódica.'),
        ('QUI', 2, 'Enlaces y compuestos', 'Enlace iónico, covalente y formulación.'),
        ('QUI', 3, 'Reacciones químicas', 'Ecuaciones, balanceo y tipos de reacciones.'),
        ('HIS', 1, 'Edad Antigua y Media', 'Civilizaciones antiguas y el mundo medieval.'),
        ('HIS', 2, 'Edad Moderna', 'Renacimiento, exploraciones y revoluciones.'),
        ('HIS', 3, 'Ecuador republicano', 'Formación del Estado ecuatoriano y siglo XX.')
),
targets AS (
    SELECT
        sj.id AS subject_id,
        tc.rn,
        tc.title,
        tc.description,
        md5(sj.id::text || ':topic:' || tc.rn::text) AS h
    FROM subjects sj
    JOIN subject_catalog sc ON sc.id = sj.subject_catalog_id
    JOIN topic_catalog tc ON tc.code = sc.code
    WHERE sj.section_id IS NOT NULL
)
INSERT INTO topics (id, subject_id, title, description, "order", created_at, updated_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    subject_id, title, description, rn, NOW(), NOW()
FROM targets
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    "order" = EXCLUDED."order",
    updated_at = NOW();
