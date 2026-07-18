-- =====================================================
-- SEED: ACADEMIC PERIODS
-- MentoraPredict
-- =====================================================

INSERT INTO academic_periods (id, name, code, description, start_date, end_date, status, type, created_at, updated_at) VALUES

-- =====================================================
-- 2025
-- =====================================================
('aaaaaaaa-2025-4111-8111-111111111111', '2025-A', '2025A', 'Periodo académico primer semestre 2025', '2025-03-01', '2025-08-31', 'FINISHED', 'SEMESTER', NOW(), NOW()),

('bbbbbbbb-2025-4111-8111-111111111111', '2025-B', '2025B', 'Periodo académico segundo semestre 2025', '2025-09-01', '2026-02-28', 'FINISHED', 'SEMESTER', NOW(), NOW()),

-- =====================================================
-- 2026
-- =====================================================
('aaaaaaaa-2026-4111-8111-111111111111', '2026-A', '2026A', 'Periodo académico primer semestre 2026', '2026-03-01', '2026-08-31', 'ACTIVE', 'SEMESTER', NOW(), NOW()),

('bbbbbbbb-2026-4111-8111-111111111111', '2026-B', '2026B', 'Periodo académico segundo semestre 2026', '2026-09-01', '2027-02-28', 'PLANNED', 'SEMESTER', NOW(), NOW()),

-- =====================================================
-- 2027
-- =====================================================
('aaaaaaaa-2027-4111-8111-111111111111', '2027-A', '2027A', 'Periodo académico primer semestre 2027', '2027-03-01', '2027-08-31', 'PLANNED', 'SEMESTER', NOW(), NOW()),

('bbbbbbbb-2027-4111-8111-111111111111', '2027-B', '2027B', 'Periodo académico segundo semestre 2027', '2027-09-01', '2028-02-28', 'PLANNED', 'SEMESTER', NOW(), NOW()),

-- =====================================================
-- 2028
-- =====================================================
('aaaaaaaa-2028-4111-8111-111111111111', '2028-A', '2028A', 'Periodo académico primer semestre 2028', '2028-03-01', '2028-08-31', 'PLANNED', 'SEMESTER', NOW(), NOW()),

('bbbbbbbb-2028-4111-8111-111111111111', '2028-B', '2028B', 'Periodo académico segundo semestre 2028', '2028-09-01', '2029-02-28', 'PLANNED', 'SEMESTER', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    type = EXCLUDED.type,
    updated_at = NOW();
