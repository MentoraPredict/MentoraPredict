-- =====================================================
-- AÑO LECTIVO Y PERIODOS DE CALIFICACIÓN
-- Año lectivo 2026-2027, régimen Sierra-Amazonía, tres trimestres.
--
-- Las fechas son de ejemplo para el entorno de pruebas: el calendario
-- oficial lo publica cada año el Ministerio de Educación y se edita desde
-- el panel de administración (Años lectivos).
--
-- Solo puede haber un año lectivo ACTIVE y un periodo ACTIVE a la vez
-- (índices únicos parciales); este seed deja activos el año y el primer
-- trimestre. Está pensado para una base de datos recién creada.
-- =====================================================

INSERT INTO school_years (
    id, name, code, regime, period_scheme, periods_count,
    start_date, end_date, min_class_days, status,
    created_at, updated_at
) VALUES (
    'a0000000-2026-4000-8000-000000000001',
    'Año lectivo 2026-2027', '2026-2027',
    'SIERRA_AMAZONIA', 'TRIMESTER', 3,
    '2026-09-07', '2027-06-30', 200, 'ACTIVE',
    NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    regime = EXCLUDED.regime,
    period_scheme = EXCLUDED.period_scheme,
    periods_count = EXCLUDED.periods_count,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    min_class_days = EXCLUDED.min_class_days,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO academic_periods (
    id, name, code, description, start_date, end_date,
    status, type, school_year_id, period_number, grades_due_date,
    created_at, updated_at
) VALUES
    ('a0000000-2026-4000-8000-0000000000b1', 'Primer trimestre 2026-2027',  '2026-2027-T1', 'Primer trimestre del año lectivo 2026-2027',
     '2026-09-07', '2026-11-27', 'ACTIVE',  'TRIMESTER', 'a0000000-2026-4000-8000-000000000001', 1, '2026-12-04', NOW(), NOW()),
    ('a0000000-2026-4000-8000-0000000000b2', 'Segundo trimestre 2026-2027',  '2026-2027-T2', 'Segundo trimestre del año lectivo 2026-2027',
     '2026-11-30', '2027-03-05', 'PLANNED', 'TRIMESTER', 'a0000000-2026-4000-8000-000000000001', 2, '2027-03-12', NOW(), NOW()),
    ('a0000000-2026-4000-8000-0000000000b3', 'Tercer trimestre 2026-2027',  '2026-2027-T3', 'Tercer trimestre del año lectivo 2026-2027',
     '2027-03-08', '2027-06-30', 'PLANNED', 'TRIMESTER', 'a0000000-2026-4000-8000-000000000001', 3, '2027-07-07', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    type = EXCLUDED.type,
    school_year_id = EXCLUDED.school_year_id,
    period_number = EXCLUDED.period_number,
    grades_due_date = EXCLUDED.grades_due_date,
    updated_at = NOW();
