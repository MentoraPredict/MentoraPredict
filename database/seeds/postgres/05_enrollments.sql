-- =====================================================
-- ENROLLMENTS - 3 a 5 materias por estudiante
-- =====================================================

WITH students AS (
    SELECT id
    FROM users
    WHERE role = 'STUDENT'
),

subjects AS (
    SELECT id
    FROM subjects
),

period AS (
    SELECT 'aaaaaaaa-2026-1111-1111-111111111111'::uuid AS period_id
),

pairs AS (
    SELECT
        s.id AS student_id,
        sub.id AS subject_id,
        p.period_id,
        random() AS r
    FROM students s
    CROSS JOIN subjects sub
    CROSS JOIN period p
),

ranked AS (
    SELECT
        gen_random_uuid() AS id,
        student_id,
        subject_id,
        period_id,

        row_number() OVER (
            PARTITION BY student_id
            ORDER BY r
        ) AS rn,

        CASE
            WHEN random() < 0.7 THEN 'ACTIVE'
            WHEN random() < 0.9 THEN 'WITHDRAWN'
            ELSE 'SUSPENDED'
        END AS status,

        now() - (random() * interval '60 days') AS enrolled_at

    FROM pairs
)

INSERT INTO enrollments (
    id,
    student_id,
    subject_id,
    period_id,
    status,
    enrolled_at,
    created_at
)
SELECT
    id,
    student_id,
    subject_id,
    period_id,
    status,
    enrolled_at,
    now()
FROM ranked
WHERE rn <= (3 + floor(random() * 3));