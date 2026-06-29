-- =====================================================
-- GRADES
-- =====================================================

WITH active_enrollments AS (
    SELECT
        en.student_id,
        en.subject_id
    FROM enrollments en
    WHERE en.status = 'ACTIVE'
),

valid_evaluations AS (
    SELECT
        ev.id AS evaluation_id,
        ev.subject_id
    FROM evaluations ev
),

data AS (
    SELECT
        gen_random_uuid() AS id,
        ae.student_id,
        ae.subject_id,
        ve.evaluation_id,

        (2 + floor(random() * 8))::int AS value, -- 2–9 (escala valida del backend: 0–10)

        -- docente responsable (si quieres más realista luego lo cambiamos)
        (SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1) AS registered_by,

        now() - (random() * interval '30 days') AS registered_at

    FROM active_enrollments ae
    JOIN valid_evaluations ve
        ON ve.subject_id = ae.subject_id
)

INSERT INTO grades (
    id,
    student_id,
    subject_id,
    evaluation_id,
    value,
    registered_by,
    registered_at,
    created_at,
    updated_at
)
SELECT
    id,
    student_id,
    subject_id,
    evaluation_id,
    value,
    registered_by,
    registered_at,
    now(),
    now()
FROM data;

-- =====================================================
-- GRADE HISTORY - FIXED
-- =====================================================

WITH changed_grades AS (
    SELECT
        g.id,
        g.value,

        -- simulamos solo algunas modificaciones reales
        (random() < 0.3) AS was_changed
    FROM grades g
),

data AS (
    SELECT
        gen_random_uuid() AS id,
        cg.id AS grade_id,

        -- solo si hubo cambio real
        CASE
            WHEN cg.was_changed THEN
                GREATEST(0, cg.value - (1 + floor(random() * 5)))
            ELSE NULL
        END AS previous_value,

        cg.value AS new_value,

        (SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1) AS changed_by,

        now() - (random() * interval '20 days') AS changed_at,

        cg.was_changed

    FROM changed_grades cg
)

INSERT INTO grade_history (
    id,
    grade_id,
    previous_value,
    new_value,
    changed_by,
    changed_at
)
SELECT
    id,
    grade_id,
    previous_value,
    new_value,
    changed_by,
    changed_at
FROM data
WHERE was_changed = true;
