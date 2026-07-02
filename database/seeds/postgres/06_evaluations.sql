-- =====================================================
-- EVALUATIONS - deterministic and idempotent
-- =====================================================

WITH subjects AS (
    SELECT id
    FROM subjects
),

data AS (
    SELECT
        s.id AS subject_id,
        gs.rn,
        md5(s.id::text || ':evaluation:' || gs.rn::text) AS seed_hash
    FROM subjects s
    CROSS JOIN generate_series(1, 5) AS gs(rn)
    WHERE gs.rn <= 3 + (('x' || substr(md5(s.id::text || ':evaluation-count'), 1, 2))::bit(8)::int % 3)
),

evaluations_seed AS (
    SELECT
        (
            substr(seed_hash, 1, 8) || '-' ||
            substr(seed_hash, 9, 4) || '-4' ||
            substr(seed_hash, 14, 3) || '-8' ||
            substr(seed_hash, 18, 3) || '-' ||
            substr(seed_hash, 21, 12)
        )::uuid AS id,
        subject_id,
        CASE rn
            WHEN 1 THEN 'Quiz'
            WHEN 2 THEN 'Tarea Practica'
            WHEN 3 THEN 'Examen Parcial'
            WHEN 4 THEN 'Proyecto'
            ELSE 'Examen Final'
        END AS name,
        CASE rn
            WHEN 1 THEN 10
            WHEN 2 THEN 20
            WHEN 3 THEN 25
            WHEN 4 THEN 25
            ELSE 20
        END AS weight,
        now() + ((rn * 14) * interval '1 day') AS due_date,
        (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 10) <> 0 AS is_active
    FROM data
)

INSERT INTO evaluations (
    id,
    name,
    weight,
    subject_id,
    due_date,
    is_active,
    created_at,
    updated_at
)
SELECT
    id,
    name,
    weight,
    subject_id,
    due_date,
    is_active,
    now(),
    now()
FROM evaluations_seed
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    weight = EXCLUDED.weight,
    subject_id = EXCLUDED.subject_id,
    due_date = EXCLUDED.due_date,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
