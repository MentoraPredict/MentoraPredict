-- =====================================================
-- EVALUATIONS - FIXED
-- =====================================================

WITH subjects AS (
    SELECT id
    FROM subjects
),

data AS (
    SELECT
        gen_random_uuid() AS id,
        s.id AS subject_id,
        row_number() OVER (PARTITION BY s.id) AS rn
    FROM subjects s
    CROSS JOIN generate_series(1, 6)
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

    -- nombre de evaluación realista
    CASE (floor(random() * 4))
        WHEN 0 THEN 'Examen Parcial'
        WHEN 1 THEN 'Tarea Práctica'
        WHEN 2 THEN 'Proyecto'
        ELSE 'Quiz'
    END AS name,

    CASE (floor(random() * 4))
        WHEN 0 THEN 10
        WHEN 1 THEN 20
        WHEN 2 THEN 30
        ELSE 40
    END AS weight,

    subject_id,

    now() + (random() * interval '120 days') AS due_date,

    (random() > 0.15) AS is_active,

    now(),
    now()
FROM data
WHERE rn <= (3 + floor(random() * 3));