-- =====================================================
-- SEED: CAREERS
-- MentoraPredict
-- =====================================================

INSERT INTO careers (id, faculty_id, name, code, description, status, duration_semesters, created_at, updated_at) VALUES

-- =====================================================
-- FACULTAD: CIENCIAS ADMINISTRATIVAS
-- =====================================================
('c1111111-1111-4111-8111-111111111111', 'f1111111-1111-4111-8111-111111111111', 'Administración de Empresas', 'ADM', 'Gestión empresarial y dirección organizacional', 'ACTIVE', 10, NOW(), NOW()),

('c1111111-1111-4111-8111-111111111112', 'f1111111-1111-4111-8111-111111111111', 'Contabilidad y Auditoría', 'CON', 'Contabilidad financiera y auditoría', 'ACTIVE', 10, NOW(), NOW()),

('c1111111-1111-4111-8111-111111111113', 'f1111111-1111-4111-8111-111111111111', 'Marketing', 'MKT', 'Estrategias de marketing y mercado', 'ACTIVE', 10, NOW(), NOW()),

-- =====================================================
-- FACULTAD: CIENCIAS ECONÓMICAS
-- =====================================================
('c2222222-1111-4111-8111-111111111111', 'f2222222-2222-4222-8222-222222222222', 'Economía', 'ECO', 'Análisis económico y teoría económica', 'ACTIVE', 10, NOW(), NOW()),

('c2222222-1111-4111-8111-111111111112', 'f2222222-2222-4222-8222-222222222222', 'Finanzas', 'FIN', 'Gestión financiera y mercados', 'ACTIVE', 10, NOW(), NOW()),

-- =====================================================
-- FACULTAD: CIENCIAS MÉDICAS
-- =====================================================
('c3333333-1111-4111-8111-111111111111', 'f3333333-3333-4333-8333-333333333333', 'Medicina', 'MED', 'Formación médica integral', 'ACTIVE', 12, NOW(), NOW()),

('c3333333-1111-4111-8111-111111111112', 'f3333333-3333-4333-8333-333333333333', 'Enfermería', 'ENF', 'Cuidado y atención en salud', 'ACTIVE', 8, NOW(), NOW()),

-- =====================================================
-- FACULTAD: PSICOLOGÍA
-- =====================================================
('c4444444-1111-4111-8111-111111111111', 'f4444444-4444-4444-8444-444444444444', 'Psicología Clínica', 'PSC', 'Diagnóstico y tratamiento psicológico', 'ACTIVE', 10, NOW(), NOW()),

('c4444444-1111-4111-8111-111111111112', 'f4444444-4444-4444-8444-444444444444', 'Psicología Educativa', 'PSE', 'Psicología aplicada a la educación', 'ACTIVE', 10, NOW(), NOW()),

-- =====================================================
-- FACULTAD: INGENIERÍA
-- =====================================================
('c5555555-1111-4111-8111-111111111111', 'f5555555-5555-4555-8555-555555555555', 'Ingeniería en Sistemas de Información', 'ISI', 'Desarrollo de software y sistemas', 'ACTIVE', 10, NOW(), NOW()),

('c5555555-1111-4111-8111-111111111112', 'f5555555-5555-4555-8555-555555555555', 'Ingeniería Civil', 'CIV', 'Diseño y construcción de infraestructura', 'ACTIVE', 10, NOW(), NOW()),

-- =====================================================
-- FACULTAD: JURISPRUDENCIA
-- =====================================================
('c7777777-1111-4111-8111-111111111111', 'f7777777-7777-4777-8777-777777777777', 'Derecho', 'DER', 'Ciencias jurídicas y legales', 'ACTIVE', 10, NOW(), NOW()),

('c7777777-1111-4111-8111-111111111112', 'f7777777-7777-4777-8777-777777777777', 'Ciencias Políticas', 'POL', 'Gobierno, política y administración pública', 'ACTIVE', 10, NOW(), NOW()),

-- =====================================================
-- FACULTAD: CIENCIAS SOCIALES
-- =====================================================
('c8888888-1111-4111-8111-111111111111', 'f8888888-8888-4888-8888-888888888888', 'Sociología', 'SOC', 'Estudio de la sociedad y estructuras sociales', 'ACTIVE', 10, NOW(), NOW()),

('c8888888-1111-4111-8111-111111111112', 'f8888888-8888-4888-8888-888888888888', 'Trabajo Social', 'TSO', 'Intervención social y comunitaria', 'ACTIVE', 8, NOW(), NOW()),

-- =====================================================
-- FACULTAD: ARTES
-- =====================================================
('c9999999-1111-4111-8111-111111111111', 'f9999999-9999-4999-8999-999999999999', 'Artes Plásticas', 'ARTP', 'Expresión visual y artística', 'ACTIVE', 8, NOW(), NOW()),

('c9999999-1111-4111-8111-111111111112', 'f9999999-9999-4999-8999-999999999999', 'Artes Musicales', 'ARTM', 'Formación musical y sonora', 'ACTIVE', 8, NOW(), NOW()),

-- =====================================================
-- FACULTAD: ARQUITECTURA
-- =====================================================
('caaaaaaa-1111-4111-8111-111111111111', 'faaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Arquitectura', 'ARQ', 'Diseño arquitectónico y urbano', 'ACTIVE', 10, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;