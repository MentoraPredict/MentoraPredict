-- =====================================================
-- ACADEMIC CORE SEED - FACULTIES / CAREERS / PERIODS
-- MentoraPredict
-- =====================================================

-- =========================
-- FACULTIES
-- =========================

INSERT INTO faculties (id, name, code, description, status, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Facultad de Ciencias Administrativas', 'FCA', 'Gestión empresarial y administración', 'ACTIVE', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Facultad de Ciencias Económicas', 'FCE', 'Economía y finanzas', 'ACTIVE', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Facultad de Ciencias Médicas', 'FCM', 'Salud y medicina', 'ACTIVE', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Facultad de Ciencias Psicológicas', 'FCP', 'Psicología y comportamiento humano', 'ACTIVE', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Facultad de Ingeniería y Ciencias Aplicadas', 'FICA', 'Ingeniería multidisciplinaria', 'ACTIVE', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Facultad de Ingeniería Química', 'FIQ', 'Procesos químicos industriales', 'ACTIVE', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'Facultad de Jurisprudencia, Ciencias Políticas y Sociales', 'FJPS', 'Derecho y política', 'ACTIVE', NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'Facultad de Ciencias Sociales y Humanas', 'FCSH', 'Sociedad y humanidades', 'ACTIVE', NOW(), NOW()),
('99999999-9999-9999-9999-999999999999', 'Facultad de Artes', 'FA', 'Arte y expresión creativa', 'ACTIVE', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Facultad de Arquitectura y Urbanismo', 'FAU', 'Diseño arquitectónico', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =========================
-- CAREERS
-- =========================
INSERT INTO careers (id, faculty_id, name, code, description, status, duration_semesters, created_at, updated_at) VALUES

-- Ciencias Administrativas
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Administración de Empresas', 'ADM', 'Gestión empresarial', 'ACTIVE', 10, NOW(), NOW()),
('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Contabilidad y Auditoría', 'CON', 'Contabilidad financiera', 'ACTIVE', 10, NOW(), NOW()),
('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Marketing', 'MKT', 'Marketing estratégico', 'ACTIVE', 10, NOW(), NOW()),

-- Económicas
('22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Economía', 'ECO', 'Economía general', 'ACTIVE', 10, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Finanzas', 'FIN', 'Gestión financiera', 'ACTIVE', 10, NOW(), NOW()),

-- Médicas
('33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Medicina', 'MED', 'Ciencias médicas', 'ACTIVE', 12, NOW(), NOW()),
('33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Enfermería', 'ENF', 'Cuidado de salud', 'ACTIVE', 8, NOW(), NOW()),

-- Psicológicas
('44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Psicología Clínica', 'PSC', 'Salud mental clínica', 'ACTIVE', 10, NOW(), NOW()),
('44444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Psicología Educativa', 'PSE', 'Psicología en educación', 'ACTIVE', 10, NOW(), NOW()),

-- Ingeniería
('55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Ingeniería en Sistemas de Información', 'ISI', 'Software y sistemas', 'ACTIVE', 10, NOW(), NOW()),
('55555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'Ingeniería Civil', 'CIV', 'Infraestructura', 'ACTIVE', 10, NOW(), NOW()),

-- Jurídicas
('77777777-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', 'Derecho', 'DER', 'Ciencias jurídicas', 'ACTIVE', 10, NOW(), NOW()),
('77777777-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777', 'Ciencias Políticas', 'POL', 'Gobierno y política', 'ACTIVE', 10, NOW(), NOW()),

-- Sociales
('88888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888888', 'Sociología', 'SOC', 'Estudio social', 'ACTIVE', 10, NOW(), NOW()),
('88888888-8888-8888-8888-888888888882', '88888888-8888-8888-8888-888888888888', 'Trabajo Social', 'TSO', 'Intervención social', 'ACTIVE', 8, NOW(), NOW()),

-- Artes
('99999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999999', 'Artes Plásticas', 'ARTP', 'Arte visual', 'ACTIVE', 8, NOW(), NOW()),
('99999999-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999999', 'Artes Musicales', 'ARTM', 'Música y sonido', 'ACTIVE', 8, NOW(), NOW()),

ON CONFLICT (id) DO NOTHING;

-- =========================
-- ACADEMIC PERIODS
-- =========================
INSERT INTO academic_periods (
    id, name, code, description,
    start_date, end_date,
    status, type,
    created_at, updated_at
) VALUES

-- 2025
('00000001-1111-1111-1111-111111111111',
 '2025-A', '2025A',
 'Periodo académico primer semestre 2025',
 '2025-03-01', '2025-08-31',
 'FINISHED', 'SEMESTER',
 NOW(), NOW()),

('00000002-1111-1111-1111-111111111111',
 '2025-B', '2025B',
 'Periodo académico segundo semestre 2025',
 '2025-09-01', '2026-02-28',
 'FINISHED', 'SEMESTER',
 NOW(), NOW()),

-- 2026 (YA TUYO + completado)
('11111111-1111-1111-1111-111111111111',
 '2026-A', '2026A',
 'Periodo académico primer semestre 2026',
 '2026-03-01', '2026-08-31',
 'ACTIVE', 'SEMESTER',
 NOW(), NOW()),

('22222222-2222-2222-2222-222222222222',
 '2026-B', '2026B',
 'Periodo académico segundo semestre 2026',
 '2026-09-01', '2027-02-28',
 'PLANNED', 'SEMESTER',
 NOW(), NOW()),

-- 2027
('33333333-3333-3333-3333-333333333333',
 '2027-A', '2027A',
 'Periodo académico primer semestre 2027',
 '2027-03-01', '2027-08-31',
 'PLANNED', 'SEMESTER',
 NOW(), NOW()),

('44444444-4444-4444-4444-444444444444',
 '2027-B', '2027B',
 'Periodo académico segundo semestre 2027',
 '2027-09-01', '2028-02-28',
 'PLANNED', 'SEMESTER',
 NOW(), NOW()),

-- 2028 (futuro planificación)
('55555555-5555-5555-5555-555555555555',
 '2028-A', '2028A',
 'Periodo académico primer semestre 2028',
 '2028-03-01', '2028-08-31',
 'PLANNED', 'SEMESTER',
 NOW(), NOW()),

('66666666-6666-6666-6666-666666666666',
 '2028-B', '2028B',
 'Periodo académico segundo semestre 2028',
 '2028-09-01', '2029-02-28',
 'PLANNED', 'SEMESTER',
 NOW(), NOW()),

 ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- MATERIAS
-- =====================================================
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
) VALUES

-- =====================================================
-- SEMESTRE 1
-- =====================================================
('11111111-0001-1111-1111-111111111111', 'Introducción a la Programación', 'Lógica básica de programación', 'FP101', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

('11111111-0002-1111-1111-111111111111', 'Matemática Básica', 'Álgebra elemental', 'MAT101', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

('11111111-0003-1111-1111-111111111111', 'Lógica Computacional', 'Proposiciones lógicas', 'LOG101', 3,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 2
-- =====================================================
('22222222-0001-1111-1111-111111111111', 'Programación I', 'POO básica con Java', 'FP201', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

('22222222-0002-1111-1111-111111111111', 'Cálculo Diferencial', 'Derivadas', 'CAL201', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 3 (FOCO PRINCIPAL - ACTIVO)
-- =====================================================
('33333333-0001-1111-1111-111111111111', 'Base de Datos I', 'Modelo relacional y SQL', 'BD301', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('33333333-0002-1111-1111-111111111111', 'Arquitectura de Computadores', 'CPU, memoria y hardware', 'AC301', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('33333333-0003-1111-1111-111111111111', 'Sistemas Operativos', 'Procesos y concurrencia', 'SO301', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('33333333-0004-1111-1111-111111111111', 'Estructuras de Datos', 'Listas, árboles, grafos', 'ED301', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 4
-- =====================================================
('44444444-0001-1111-1111-111111111111', 'Base de Datos II', 'SQL avanzado y optimización', 'BD401', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('44444444-0002-1111-1111-111111111111', 'Redes de Computadores', 'TCP/IP y redes', 'NET401', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 5
-- =====================================================
('55555555-0001-1111-1111-111111111111', 'Ingeniería de Software', 'Ciclo de vida del software', 'IS501', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('55555555-0002-1111-1111-111111111111', 'Análisis de Algoritmos', 'Complejidad computacional', 'AA501', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 6
-- =====================================================
('66666666-0001-1111-1111-111111111111', 'Sistemas Distribuidos', 'Arquitecturas distribuidas', 'SD601', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('66666666-0002-1111-1111-111111111111', 'Cloud Computing', 'Servicios en la nube', 'CC601', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 7
-- =====================================================
('77777777-0001-1111-1111-111111111111', 'Inteligencia Artificial', 'Fundamentos de IA', 'IA701', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 8
-- =====================================================
('88888888-0001-1111-1111-111111111111', 'Machine Learning', 'Modelos predictivos', 'ML801', 4,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 9
-- =====================================================
('99999999-0001-1111-1111-111111111111', 'Proyecto Integrador I', 'Desarrollo de proyecto real', 'PI901', 6,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 30, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- SEMESTRE 10
-- =====================================================
('10101010-0001-1111-1111-111111111111', 'Proyecto de Titulación', 'Trabajo final de grado', 'PT1001', 8,
 '55555555-5555-5555-5555-555555555551',
 '11111111-1111-1111-1111-111111111111', 25, NULL, TRUE, NOW(), NOW()),

 ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MATERIAS DE OTRAS FACULTADES (COMPLEMENTO)
-- =====================================================
-- =====================================================
-- FACULTAD DE CIENCIAS ADMINISTRATIVAS
-- =====================================================
INSERT INTO subjects (
    id, name, description, code, credits,
    career_id, academic_period_id,
    max_capacity, teacher_id, is_active,
    created_at, updated_at
) VALUES

('11111111-1111-1111-1111-000000000001', 'Contabilidad Financiera I', 'Fundamentos contables', 'CON101', 4,
 '11111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

('11111111-2222-2222-2222-000000000002', 'Administración General', 'Principios de administración', 'ADM101', 4,
 '11111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- FACULTAD DE CIENCIAS ECONÓMICAS
-- =====================================================
('22222222-1111-1111-1111-000000000001', 'Microeconomía I', 'Oferta y demanda', 'ECO201', 4,
 '22222222-2222-2222-2222-222222222221',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

('22222222-2222-2222-2222-000000000002', 'Macroeconomía I', 'Indicadores económicos', 'ECO202', 4,
 '22222222-2222-2222-2222-222222222221',
 '11111111-1111-1111-1111-111111111111', 45, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- FACULTAD DE CIENCIAS MÉDICAS
-- =====================================================
('33333333-1111-1111-1111-000000000001', 'Anatomía Humana', 'Estructura del cuerpo humano', 'MED101', 6,
 '33333333-3333-3333-3333-333333333331',
 '11111111-1111-1111-1111-111111111111', 35, NULL, TRUE, NOW(), NOW()),

('33333333-2222-2222-2222-000000000002', 'Fisiología', 'Funcionamiento del organismo', 'MED102', 6,
 '33333333-3333-3333-3333-333333333331',
 '11111111-1111-1111-1111-111111111111', 35, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- FACULTAD DE PSICOLOGÍA
-- =====================================================
('44444444-1111-1111-1111-000000000001', 'Psicología General', 'Bases del comportamiento humano', 'PSY101', 4,
 '44444444-4444-4444-4444-444444444441',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

('44444444-2222-2222-2222-000000000002', 'Psicología del Desarrollo', 'Etapas del desarrollo humano', 'PSY102', 4,
 '44444444-4444-4444-4444-444444444441',
 '11111111-1111-1111-1111-111111111111', 40, NULL, TRUE, NOW(), NOW()),

-- =====================================================
-- FACULTAD DE ARTES (FIX UUID ERROR + CONSISTENCIA)
-- =====================================================
('99999999-1111-1111-1111-000000000001', 'Dibujo Artístico', 'Técnicas de dibujo', 'ART101', 3,
 '99999999-9999-9999-9999-999999999991',
 '11111111-1111-1111-1111-111111111111', 30, NULL, TRUE, NOW(), NOW()),

('99999999-2222-2222-2222-000000000002', 'Historia del Arte', 'Corrientes artísticas', 'ART102', 3,
 '99999999-9999-9999-9999-999999999991',
 '11111111-1111-1111-1111-111111111111', 30, NULL, TRUE, NOW(), NOW()),

 ON CONFLICT (id) DO NOTHING;
