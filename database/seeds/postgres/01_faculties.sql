-- =====================================================
-- SEED: FACULTIES
-- MentoraPredict
-- =====================================================

-- =========================
-- FACULTADES -FACULTIES
-- =========================
INSERT INTO faculties (id, name, code, description, status, created_at, updated_at) VALUES
('f1111111-1111-4111-8111-111111111111', 'Facultad de Ciencias Administrativas', 'FCA', 'Gestión empresarial y administración', 'ACTIVE', NOW(), NOW()),
('f2222222-2222-4222-8222-222222222222', 'Facultad de Ciencias Económicas', 'FCE', 'Economía y finanzas', 'ACTIVE', NOW(), NOW()),
('f3333333-3333-4333-8333-333333333333', 'Facultad de Ciencias Médicas', 'FCM', 'Salud y medicina', 'ACTIVE', NOW(), NOW()),
('f4444444-4444-4444-8444-444444444444', 'Facultad de Ciencias Psicológicas', 'FCP', 'Psicología y comportamiento humano', 'ACTIVE', NOW(), NOW()),
('f5555555-5555-4555-8555-555555555555', 'Facultad de Ingeniería y Ciencias Aplicadas', 'FICA', 'Ingeniería multidisciplinaria', 'ACTIVE', NOW(), NOW()),
('f6666666-6666-4666-8666-666666666666', 'Facultad de Ingeniería Química', 'FIQ', 'Procesos químicos industriales', 'ACTIVE', NOW(), NOW()),
('f7777777-7777-4777-8777-777777777777', 'Facultad de Jurisprudencia, Ciencias Políticas y Sociales', 'FJPS', 'Derecho y política', 'ACTIVE', NOW(), NOW()),
('f8888888-8888-4888-8888-888888888888', 'Facultad de Ciencias Sociales y Humanas', 'FCSH', 'Sociedad y humanidades', 'ACTIVE', NOW(), NOW()),
('f9999999-9999-4999-8999-999999999999', 'Facultad de Artes', 'FA', 'Arte y expresión creativa', 'ACTIVE', NOW(), NOW()),
('faaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Facultad de Arquitectura y Urbanismo', 'FAU', 'Diseño arquitectónico y urbano', 'ACTIVE', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;