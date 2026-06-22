-- =====================================================
-- USER PROFILES
-- Relación lógica: user_profiles.id = users.id
-- 3 Administradores + 15 Docentes
-- =====================================================

INSERT INTO user_profiles (
    id,
    photo,
    bio,
    cedula,
    auth_provider,
    role,
    status,
    deleted_at,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- ADMINISTRADORES
-- =====================================================

(
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Administrador general de la plataforma MentoraPredict.',
    '1700000001',
    'LOCAL',
    'ADMIN',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Administrador de operaciones académicas.',
    '1700000002',
    'LOCAL',
    'ADMIN',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Administrador de infraestructura y monitoreo.',
    '1700000003',
    'LOCAL',
    'ADMIN',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

-- =====================================================
-- DOCENTES
-- =====================================================

(
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Docente de Programación y Desarrollo de Software.',
    '1800000001',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Docente de Bases de Datos.',
    '1800000002',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Docente de Ingeniería de Software.',
    '1800000003',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000004',
    NULL,
    'Docente de Redes y Telecomunicaciones.',
    '1800000004',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000005',
    NULL,
    'Docente de Arquitectura de Computadores.',
    '1800000005',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000006',
    NULL,
    'Docente de Sistemas Operativos.',
    '1800000006',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'Docente de Inteligencia Artificial.',
    '1800000007',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000008',
    NULL,
    'Docente de Machine Learning y Analítica.',
    '1800000008',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000009',
    NULL,
    'Docente de Matemática Aplicada.',
    '1800000009',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000010',
    NULL,
    'Docente de Estadística.',
    '1800000010',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000011',
    NULL,
    'Docente de Física.',
    '1800000011',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000012',
    NULL,
    'Docente de Investigación Científica.',
    '1800000012',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000013',
    NULL,
    'Docente de Gestión de Proyectos.',
    '1800000013',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000014',
    NULL,
    'Docente de Cloud Computing.',
    '1800000014',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000015',
    NULL,
    'Docente de Sistemas Distribuidos.',
    '1800000015',
    'LOCAL',
    'TEACHER',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
)

ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
    id,
    photo,
    bio,
    cedula,
    auth_provider,
    role,
    status,
    deleted_at,
    created_at,
    updated_at
) VALUES

('30000000-0000-0000-0000-000000000001', NULL, 'Estudiante de MentoraPredict', '0100000001', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', NULL, 'Estudiante de MentoraPredict', '0100000002', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', NULL, 'Estudiante de MentoraPredict', '0100000003', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', NULL, 'Estudiante de MentoraPredict', '0100000004', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000005', NULL, 'Estudiante de MentoraPredict', '0100000005', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000006', NULL, 'Estudiante de MentoraPredict', '0100000006', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000007', NULL, 'Estudiante de MentoraPredict', '0100000007', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000008', NULL, 'Estudiante de MentoraPredict', '0100000008', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000009', NULL, 'Estudiante de MentoraPredict', '0100000009', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000010', NULL, 'Estudiante de MentoraPredict', '0100000010', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),

('30000000-0000-0000-0000-000000000011', NULL, 'Estudiante de MentoraPredict', '0100000011', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000012', NULL, 'Estudiante de MentoraPredict', '0100000012', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000013', NULL, 'Estudiante de MentoraPredict', '0100000013', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000014', NULL, 'Estudiante de MentoraPredict', '0100000014', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000015', NULL, 'Estudiante de MentoraPredict', '0100000015', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000016', NULL, 'Estudiante de MentoraPredict', '0100000016', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000017', NULL, 'Estudiante de MentoraPredict', '0100000017', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000018', NULL, 'Estudiante de MentoraPredict', '0100000018', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000019', NULL, 'Estudiante de MentoraPredict', '0100000019', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000020', NULL, 'Estudiante de MentoraPredict', '0100000020', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),

('30000000-0000-0000-0000-000000000021', NULL, 'Estudiante de MentoraPredict', '0100000021', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000022', NULL, 'Estudiante de MentoraPredict', '0100000022', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000023', NULL, 'Estudiante de MentoraPredict', '0100000023', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000024', NULL, 'Estudiante de MentoraPredict', '0100000024', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000025', NULL, 'Estudiante de MentoraPredict', '0100000025', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000026', NULL, 'Estudiante de MentoraPredict', '0100000026', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000027', NULL, 'Estudiante de MentoraPredict', '0100000027', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000028', NULL, 'Estudiante de MentoraPredict', '0100000028', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000029', NULL, 'Estudiante de MentoraPredict', '0100000029', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000030', NULL, 'Estudiante de MentoraPredict', '0100000030', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),

('30000000-0000-0000-0000-000000000031', NULL, 'Estudiante de MentoraPredict', '0100000031', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000032', NULL, 'Estudiante de MentoraPredict', '0100000032', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000033', NULL, 'Estudiante de MentoraPredict', '0100000033', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000034', NULL, 'Estudiante de MentoraPredict', '0100000034', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000035', NULL, 'Estudiante de MentoraPredict', '0100000035', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000036', NULL, 'Estudiante de MentoraPredict', '0100000036', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000037', NULL, 'Estudiante de MentoraPredict', '0100000037', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000038', NULL, 'Estudiante de MentoraPredict', '0100000038', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000039', NULL, 'Estudiante de MentoraPredict', '0100000039', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000040', NULL, 'Estudiante de MentoraPredict', '0100000040', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),

('30000000-0000-0000-0000-000000000041', NULL, 'Estudiante de MentoraPredict', '0100000041', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000042', NULL, 'Estudiante de MentoraPredict', '0100000042', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000043', NULL, 'Estudiante de MentoraPredict', '0100000043', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000044', NULL, 'Estudiante de MentoraPredict', '0100000044', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000045', NULL, 'Estudiante de MentoraPredict', '0100000045', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000046', NULL, 'Estudiante de MentoraPredict', '0100000046', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000047', NULL, 'Estudiante de MentoraPredict', '0100000047', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000048', NULL, 'Estudiante de MentoraPredict', '0100000048', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000049', NULL, 'Estudiante de MentoraPredict', '0100000049', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW()),
('30000000-0000-0000-0000-000000000050', NULL, 'Estudiante de MentoraPredict', '0100000050', 'LOCAL', 'STUDENT', 'ACTIVE', NULL, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;