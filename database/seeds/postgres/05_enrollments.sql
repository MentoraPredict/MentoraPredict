-- =====================================================
-- ENROLLMENTS - deterministic 3 to 5 subjects per student
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
    SELECT 'aaaaaaaa-2026-4111-8111-111111111111'::uuid AS period_id
),

pairs AS (
    SELECT
        s.id AS student_id,
        sub.id AS subject_id,
        p.period_id,
        md5(s.id::text || ':' || sub.id::text || ':' || p.period_id::text) AS seed_hash,
        row_number() OVER (
            PARTITION BY s.id
            ORDER BY md5(s.id::text || ':' || sub.id::text || ':' || p.period_id::text)
        ) AS rn,
        3 + (('x' || substr(md5(s.id::text || ':limit'), 1, 2))::bit(8)::int % 3) AS max_subjects
    FROM students s
    CROSS JOIN subjects sub
    CROSS JOIN period p
),

ranked AS (
    SELECT
        (
            substr(seed_hash, 1, 8) || '-' ||
            substr(seed_hash, 9, 4) || '-4' ||
            substr(seed_hash, 14, 3) || '-8' ||
            substr(seed_hash, 18, 3) || '-' ||
            substr(seed_hash, 21, 12)
        )::uuid AS id,
        student_id,
        subject_id,
        period_id,
        CASE
            WHEN (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 10) < 7 THEN 'ACTIVE'
            WHEN (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 10) < 9 THEN 'WITHDRAWN'
            ELSE 'SUSPENDED'
        END AS status,
        now() - (((('x' || substr(seed_hash, 3, 2))::bit(8)::int % 60)) * interval '1 day') AS enrolled_at
    FROM pairs
    WHERE rn <= max_subjects
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
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    subject_id = EXCLUDED.subject_id,
    period_id = EXCLUDED.period_id,
    status = EXCLUDED.status,
    enrolled_at = EXCLUDED.enrolled_at;
