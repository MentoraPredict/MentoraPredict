INSERT INTO subjects (
    id,
    name,
    description,
    code,
    credits,
    career_id,
    academic_period_id,
    max_capacity,
    teacher_id,
    is_active,
    created_at,
    updated_at
)
SELECT 
    id::uuid,
    name,
    description,
    code,
    credits,
    career_id::uuid,
    academic_period_id::uuid,
    max_capacity,
    teacher_id::uuid,
    is_active,
    created_at,
    updated_at
FROM (
    VALUES

    -- =====================================================
    -- SEMESTRE 1
    -- =====================================================
    ('11111111-0001-4111-8111-111111111111','Introducción a la Programación','Lógica básica de programación','FP101',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',45,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 0),
     TRUE,NOW(),NOW()),

    ('11111111-0002-4111-8111-111111111111','Matemática Básica','Álgebra elemental','MAT101',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',45,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 1),
     TRUE,NOW(),NOW()),

    ('11111111-0003-4111-8111-111111111111','Lógica Computacional','Proposiciones lógicas','LOG101',3,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',45,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 2),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 2
    -- =====================================================
    ('22222222-0001-4111-8111-111111111111','Programación I','POO básica con Java','FP201',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',45,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 3),
     TRUE,NOW(),NOW()),

    ('22222222-0002-4111-8111-111111111111','Cálculo Diferencial','Derivadas','CAL201',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',45,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 4),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 3
    -- =====================================================
    ('33333333-0001-4111-8111-111111111111','Base de Datos I','Modelo relacional y SQL','BD301',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 5),
     TRUE,NOW(),NOW()),

    ('33333333-0002-4111-8111-111111111111','Arquitectura de Computadores','CPU, memoria y hardware','AC301',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 6),
     TRUE,NOW(),NOW()),

    ('33333333-0003-4111-8111-111111111111','Sistemas Operativos','Procesos y concurrencia','SO301',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 7),
     TRUE,NOW(),NOW()),

    ('33333333-0004-4111-8111-111111111111','Estructuras de Datos','Listas, árboles, grafos','ED301',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 8),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 4
    -- =====================================================
    ('44444444-0001-4111-8111-111111111111','Base de Datos II','SQL avanzado y optimización','BD401',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 9),
     TRUE,NOW(),NOW()),

    ('44444444-0002-4111-8111-111111111111','Redes de Computadores','TCP/IP y redes','NET401',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 10),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 5
    -- =====================================================
    ('55555555-0001-4111-8111-111111111111','Ingeniería de Software','Ciclo de vida del software','IS501',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 11),
     TRUE,NOW(),NOW()),

    ('55555555-0002-4111-8111-111111111111','Análisis de Algoritmos','Complejidad computacional','AA501',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 12),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 6
    -- =====================================================
    ('66666666-0001-4111-8111-111111111111','Sistemas Distribuidos','Arquitecturas distribuidas','SD601',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 13),
     TRUE,NOW(),NOW()),

    ('66666666-0002-4111-8111-111111111111','Cloud Computing','Servicios en la nube','CC601',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 14),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 7
    -- =====================================================
    ('77777777-0001-4111-8111-111111111111','Inteligencia Artificial','Fundamentos de IA','IA701',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 0),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 8
    -- =====================================================
    ('88888888-0001-4111-8111-111111111111','Machine Learning','Modelos predictivos','ML801',4,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',40,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 1),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 9
    -- =====================================================
    ('99999999-0001-4111-8111-111111111111','Proyecto Integrador I','Desarrollo de proyecto real','PI901',6,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',30,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 2),
     TRUE,NOW(),NOW()),

    -- =====================================================
    -- SEMESTRE 10
    -- =====================================================
    ('10101010-0001-4111-8111-111111111111','Proyecto de Titulación','Trabajo final de grado','PT1001',8,
     'c5555555-1111-4111-8111-111111111111','aaaaaaaa-2026-4111-8111-111111111111',25,
     (SELECT id FROM users WHERE role='TEACHER' ORDER BY id LIMIT 1 OFFSET 3),
     TRUE,NOW(),NOW())

) AS data(
    id,
    name,
    description,
    code,
    credits,
    career_id,
    academic_period_id,
    max_capacity,
    teacher_id,
    is_active,
    created_at,
    updated_at
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    code = EXCLUDED.code,
    credits = EXCLUDED.credits,
    career_id = EXCLUDED.career_id,
    academic_period_id = EXCLUDED.academic_period_id,
    max_capacity = EXCLUDED.max_capacity,
    teacher_id = EXCLUDED.teacher_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
