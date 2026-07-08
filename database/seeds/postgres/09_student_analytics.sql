-- =====================================================
-- STUDENT ANALYTICS SAMPLE DATA
-- Weekly check-ins, subject metrics, and predictions
-- =====================================================

DO $$
BEGIN
  IF to_regclass('public.weekly_check_ins') IS NOT NULL THEN
    WITH active_enrollments AS (
      SELECT
        en.student_id,
        en.subject_id,
        en.period_id
      FROM enrollments en
      WHERE en.status = 'ACTIVE'
    ),

    weeks AS (
      SELECT generate_series(0, 3) AS week_offset
    ),

    seed_data AS (
      SELECT
        ae.student_id,
        ae.subject_id,
        ae.period_id,
        w.week_offset,
        md5(ae.student_id::text || ':' || ae.subject_id::text || ':check-in:' || w.week_offset::text) AS seed_hash,
        (current_date - (w.week_offset * interval '7 days'))::date AS check_in_date
      FROM active_enrollments ae
      CROSS JOIN weeks w
    ),

    check_ins AS (
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
        EXTRACT(WEEK FROM check_in_date)::int AS academic_week,
        EXTRACT(YEAR FROM check_in_date)::int AS academic_year,
        check_in_date,
        (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 10) >= 2 AS attendance,
        (55 + (('x' || substr(seed_hash, 3, 2))::bit(8)::int % 46))::int AS task_completion,
        (1 + (('x' || substr(seed_hash, 5, 2))::bit(8)::int % 10))::numeric(5,2) AS study_hours,
        CASE (('x' || substr(seed_hash, 7, 2))::bit(8)::int % 5)
          WHEN 0 THEN 'CRITICAL'
          WHEN 1 THEN 'BAD'
          WHEN 2 THEN 'NEUTRAL'
          WHEN 3 THEN 'GOOD'
          ELSE 'GREAT'
        END AS emotional_state,
        (45 + (('x' || substr(seed_hash, 9, 2))::bit(8)::int % 56))::int AS general_comprehension,
        seed_hash
      FROM seed_data
    )

    INSERT INTO weekly_check_ins (
      id,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      check_in_date,
      attendance,
      task_completion,
      study_hours,
      emotional_state,
      general_comprehension,
      topic_responses,
      notes,
      created_at,
      updated_at
    )
    SELECT
      id,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      check_in_date,
      attendance,
      task_completion,
      study_hours,
      emotional_state,
      general_comprehension,
      jsonb_build_array(
        jsonb_build_object('topicId', '1', 'comprehension', general_comprehension),
        jsonb_build_object('topicId', '2', 'comprehension', LEAST(100, general_comprehension + 8)),
        jsonb_build_object('topicId', '3', 'comprehension', GREATEST(0, general_comprehension - 10))
      ),
      'Registro semanal generado por seed para validar analitica por materia.',
      now(),
      now()
    FROM check_ins
    ON CONFLICT (student_id, subject_id, academic_week, academic_year) DO UPDATE SET
      period_id = EXCLUDED.period_id,
      check_in_date = EXCLUDED.check_in_date,
      attendance = EXCLUDED.attendance,
      task_completion = EXCLUDED.task_completion,
      study_hours = EXCLUDED.study_hours,
      emotional_state = EXCLUDED.emotional_state,
      general_comprehension = EXCLUDED.general_comprehension,
      topic_responses = EXCLUDED.topic_responses,
      notes = EXCLUDED.notes,
      updated_at = now();
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_subject_metrics') IS NOT NULL THEN
    WITH grade_average AS (
      SELECT
        g.student_id,
        g.subject_id,
        ROUND(AVG(g.value)::numeric, 2) AS average_grade
      FROM grades g
      GROUP BY g.student_id, g.subject_id
    ),

    latest_check_ins AS (
      SELECT
        wc.student_id,
        wc.subject_id,
        wc.period_id,
        wc.academic_week,
        wc.academic_year,
        wc.attendance,
        wc.task_completion,
        wc.study_hours,
        wc.general_comprehension,
        md5(wc.student_id::text || ':' || wc.subject_id::text || ':metric:' || wc.academic_week::text) AS seed_hash
      FROM weekly_check_ins wc
    ),

    metric_rows AS (
      SELECT
        (
          substr(seed_hash, 1, 8) || '-' ||
          substr(seed_hash, 9, 4) || '-4' ||
          substr(seed_hash, 14, 3) || '-8' ||
          substr(seed_hash, 18, 3) || '-' ||
          substr(seed_hash, 21, 12)
        )::uuid AS id,
        lc.student_id,
        lc.subject_id,
        lc.period_id,
        lc.academic_week,
        lc.academic_year,
        ROUND(
          LEAST(
            20,
            GREATEST(
              0,
              COALESCE(
                ga.average_grade,
                (10 + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 9))::numeric
              )
              + (((('x' || substr(seed_hash, 11, 2))::bit(8)::int % 7) - 3)::numeric / 5)
            )
          ),
          2
        )::numeric(4,2) AS average_grade,
        lc.task_completion AS compliance_index,
        CASE WHEN lc.attendance THEN 100 ELSE 0 END AS attendance_rate,
        lc.study_hours,
        lc.general_comprehension AS comprehension_avg,
        ((('x' || substr(seed_hash, 3, 2))::bit(8)::int % 9) - 4)::numeric(6,2) / 10 AS trend_slope
      FROM latest_check_ins lc
      LEFT JOIN grade_average ga
        ON ga.student_id = lc.student_id
       AND ga.subject_id = lc.subject_id
    )

    INSERT INTO student_subject_metrics (
      id,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      average_grade,
      compliance_index,
      attendance_rate,
      study_hours,
      comprehension_avg,
      risk_level,
      trend_slope,
      computed_at
    )
    SELECT
      id,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      average_grade,
      compliance_index,
      attendance_rate,
      study_hours,
      comprehension_avg,
      CASE
        WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 40 THEN 'CRITICAL'
        WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 55 THEN 'HIGH'
        WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 70 THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      trend_slope,
      now()
    FROM metric_rows
    ON CONFLICT (student_id, subject_id, academic_week, academic_year) DO UPDATE SET
      period_id = EXCLUDED.period_id,
      average_grade = EXCLUDED.average_grade,
      compliance_index = EXCLUDED.compliance_index,
      attendance_rate = EXCLUDED.attendance_rate,
      study_hours = EXCLUDED.study_hours,
      comprehension_avg = EXCLUDED.comprehension_avg,
      risk_level = EXCLUDED.risk_level,
      trend_slope = EXCLUDED.trend_slope,
      computed_at = now();
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_subject_predictions') IS NOT NULL THEN
    WITH metrics AS (
      SELECT
        sm.*,
        md5(sm.student_id::text || ':' || sm.subject_id::text || ':prediction:' || sm.academic_week::text) AS seed_hash
      FROM student_subject_metrics sm
    )

    INSERT INTO student_subject_predictions (
      id,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      status,
      predicted_risk_level,
      trend_slope,
      recommendation,
      computed_at
    )
    SELECT
      (
        substr(seed_hash, 1, 8) || '-' ||
        substr(seed_hash, 9, 4) || '-4' ||
        substr(seed_hash, 14, 3) || '-8' ||
        substr(seed_hash, 18, 3) || '-' ||
        substr(seed_hash, 21, 12)
      )::uuid,
      student_id,
      subject_id,
      period_id,
      academic_week,
      academic_year,
      'COMPUTED',
      risk_level,
      trend_slope,
      CASE
        WHEN risk_level IN ('CRITICAL', 'HIGH') THEN 'Prioriza esta materia esta semana: revisa contenidos pendientes, aumenta horas de estudio y solicita apoyo docente.'
        WHEN risk_level = 'MEDIUM' THEN 'Manten seguimiento semanal y refuerza los temas con menor comprension antes de la siguiente evaluacion.'
        ELSE 'Buen avance. Conserva el ritmo de estudio y registra tu progreso semanal.'
      END,
      now()
    FROM metrics
    ON CONFLICT (student_id, subject_id, academic_week, academic_year) DO UPDATE SET
      period_id = EXCLUDED.period_id,
      status = EXCLUDED.status,
      predicted_risk_level = EXCLUDED.predicted_risk_level,
      trend_slope = EXCLUDED.trend_slope,
      recommendation = EXCLUDED.recommendation,
      computed_at = now();
  END IF;
END $$;
