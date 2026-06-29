-- =====================================================
-- GRADES - deterministic and idempotent
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
        ae.student_id,
        ae.subject_id,
        ve.evaluation_id,
        md5(ae.student_id::text || ':' || ae.subject_id::text || ':' || ve.evaluation_id::text) AS seed_hash,
        (SELECT id FROM users WHERE role = 'TEACHER' ORDER BY id LIMIT 1) AS registered_by
    FROM active_enrollments ae
    JOIN valid_evaluations ve
        ON ve.subject_id = ae.subject_id
),

grades_seed AS (
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
        evaluation_id,
        (2 + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 8))::numeric(4,2) AS value,
        registered_by,
        now() - (((('x' || substr(seed_hash, 3, 2))::bit(8)::int % 30)) * interval '1 day') AS registered_at
    FROM data
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
FROM grades_seed
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    subject_id = EXCLUDED.subject_id,
    evaluation_id = EXCLUDED.evaluation_id,
    value = EXCLUDED.value,
    registered_by = EXCLUDED.registered_by,
    registered_at = EXCLUDED.registered_at,
    updated_at = NOW();

-- =====================================================
-- GRADE HISTORY - deterministic and idempotent
-- =====================================================

WITH changed_grades AS (
    SELECT
        g.id AS grade_id,
        g.value,
        g.registered_by AS changed_by,
        md5(g.id::text || ':history') AS seed_hash
    FROM grades g
    WHERE (('x' || substr(md5(g.id::text || ':history-flag'), 1, 2))::bit(8)::int % 10) < 3
),

history_seed AS (
    SELECT
        (
            substr(seed_hash, 1, 8) || '-' ||
            substr(seed_hash, 9, 4) || '-4' ||
            substr(seed_hash, 14, 3) || '-8' ||
            substr(seed_hash, 18, 3) || '-' ||
            substr(seed_hash, 21, 12)
        )::uuid AS id,
        grade_id,
        GREATEST(0, value - (1 + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 5)))::numeric(4,2) AS previous_value,
        value AS new_value,
        changed_by,
        now() - (((('x' || substr(seed_hash, 3, 2))::bit(8)::int % 20)) * interval '1 day') AS changed_at
    FROM changed_grades
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
FROM history_seed
ON CONFLICT (id) DO UPDATE SET
    grade_id = EXCLUDED.grade_id,
    previous_value = EXCLUDED.previous_value,
    new_value = EXCLUDED.new_value,
    changed_by = EXCLUDED.changed_by,
    changed_at = EXCLUDED.changed_at;
