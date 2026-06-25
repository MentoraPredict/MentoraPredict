-- =====================================================
-- SEED: SUBJECT TEACHERS
-- MentoraPredict
-- =====================================================
-- Mantiene la tabla de asignaciones alineada con las materias
-- definidas en 04_subjects.sql. Cada materia queda asociada al
-- docente y periodo academico configurados en subjects.

INSERT INTO subject_teachers (
    subject_id,
    teacher_id,
    period_id
)
SELECT
    s.id AS subject_id,
    s.teacher_id,
    s.academic_period_id AS period_id
FROM subjects s
INNER JOIN users u
    ON u.id = s.teacher_id
   AND u.role = 'TEACHER'
WHERE s.teacher_id IS NOT NULL
ON CONFLICT (subject_id, teacher_id, period_id) DO NOTHING;
