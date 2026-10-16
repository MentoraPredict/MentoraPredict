-- =====================================================
-- STUDENT ANALYTICS SAMPLE DATA
-- Weekly check-ins, subject metrics, and predictions
--
-- Originally 09_student_analytics.sql, renumbered twice while closing a
-- fresh-database seeding gap (docs/database/database-architecture.md §4):
-- the per-topic comprehension block below needs real topic UUIDs from
-- `topics` (seeded first, 10_topics.sql — Fase C), and the metrics/
-- predictions blocks need analytics_*/prediction_*_references populated
-- (11_subject_period_references.sql) before they can insert.
--
-- Check-in dates anchor to the ACTIVE period's start_date (not current_date
-- like before) so the generated weeks always land inside the period's real
-- span — the period itself is seeded to 16 weeks (04_academicPeriods.sql),
-- and this seed now generates exactly 16 weeks of check-ins/metrics to
-- match, giving CalculateTrendUseCase/GetStudentSubjectMetricsUseCase's
-- linear regression a full, dense trend line to work with instead of 4
-- scattered points. average_grade also gets a deliberate per-week upward
-- slope (see metric_rows below) so the trend/projection shown in
-- "Evolución de mi promedio" is clearly ASCENDING instead of noise-flat.
-- =====================================================

-- Corridas anteriores anclaban check_in_date a current_date, asi que cada
-- dia distinto en que se corria el seed generaba semanas nuevas que ON
-- CONFLICT no pisaba (distinto academic_week/year) — quedaban acumulando.
-- Se limpia explicitamente lo generado por este seed (marcado por su
-- `notes` fijo) antes de insertar el set nuevo, en orden de dependencia
-- (predictions/metrics referencian el mismo student/subject/week/year que
-- weekly_check_ins, sin FK entre servicios).
DO $$
BEGIN
  IF to_regclass('public.student_subject_predictions') IS NOT NULL
     AND to_regclass('public.weekly_check_ins') IS NOT NULL THEN
    DELETE FROM student_subject_predictions sp
    USING weekly_check_ins wc
    WHERE wc.notes = 'Registro semanal generado por seed para validar analitica por materia.'
      AND sp.student_id = wc.student_id
      AND sp.subject_id = wc.subject_id
      AND sp.academic_week = wc.academic_week
      AND sp.academic_year = wc.academic_year;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.student_subject_metrics') IS NOT NULL
     AND to_regclass('public.weekly_check_ins') IS NOT NULL THEN
    DELETE FROM student_subject_metrics sm
    USING weekly_check_ins wc
    WHERE wc.notes = 'Registro semanal generado por seed para validar analitica por materia.'
      AND sm.student_id = wc.student_id
      AND sm.subject_id = wc.subject_id
      AND sm.academic_week = wc.academic_week
      AND sm.academic_year = wc.academic_year;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.weekly_check_ins') IS NOT NULL THEN
    -- weekly_check_in_topic_responses cae en cascada (FK ON DELETE CASCADE).
    DELETE FROM weekly_check_ins
    WHERE notes = 'Registro semanal generado por seed para validar analitica por materia.';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.weekly_check_ins') IS NOT NULL THEN
    WITH active_enrollments AS (
      SELECT
        en.student_id,
        en.subject_id,
        en.period_id,
        ap.start_date AS period_start_date
      FROM enrollments en
      INNER JOIN academic_periods ap ON ap.id = en.period_id
      WHERE en.status = 'ACTIVE'
    ),

    weeks AS (
      SELECT generate_series(0, 15) AS week_offset
    ),

    seed_data AS (
      SELECT
        ae.student_id,
        ae.subject_id,
        ae.period_id,
        w.week_offset,
        md5(ae.student_id::text || ':' || ae.subject_id::text || ':check-in:' || w.week_offset::text) AS seed_hash,
        (ae.period_start_date + (w.week_offset * interval '7 days'))::date AS check_in_date
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
        (50 + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 51))::int AS attendance,
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
      notes = EXCLUDED.notes,
      updated_at = now();
  END IF;
END $$;

-- Fase C (docs/database/database-update-plan.md): topic_responses (jsonb)
-- fue reemplazada por weekly_check_in_topic_responses, con FK real a
-- `topics`. Se generan hasta 3 respuestas por check-in (una por cada uno de
-- los primeros 3 temas del silabo de la materia, por "order"), derivadas del
-- mismo general_comprehension que ya calculo el bloque anterior — mismos
-- valores que antes vivian en el jsonb, ahora como filas normalizadas.
-- Alcance limitado a los check-ins generados por este seed (marcados por su
-- `notes` fijo) para no tocar respuestas reales de check-ins hechos desde
-- la app.
DO $$
BEGIN
  IF to_regclass('public.weekly_check_in_topic_responses') IS NOT NULL
     AND to_regclass('public.topics') IS NOT NULL THEN
    WITH target_check_ins AS (
      SELECT wc.id AS check_in_id, wc.subject_id, wc.general_comprehension
      FROM weekly_check_ins wc
      WHERE wc.notes = 'Registro semanal generado por seed para validar analitica por materia.'
    ),

    subject_topics AS (
      SELECT
        t.subject_id,
        t.id AS topic_id,
        ROW_NUMBER() OVER (PARTITION BY t.subject_id ORDER BY t."order") AS topic_rank
      FROM topics t
    ),

    topic_response_rows AS (
      SELECT
        tci.check_in_id,
        st.topic_id,
        CASE st.topic_rank
          WHEN 1 THEN tci.general_comprehension
          WHEN 2 THEN LEAST(100, tci.general_comprehension + 8)
          ELSE GREATEST(0, tci.general_comprehension - 10)
        END AS comprehension
      FROM target_check_ins tci
      INNER JOIN subject_topics st
        ON st.subject_id = tci.subject_id
       AND st.topic_rank <= 3
    )

    INSERT INTO weekly_check_in_topic_responses (id, check_in_id, topic_id, comprehension)
    SELECT gen_random_uuid(), check_in_id, topic_id, comprehension
    FROM topic_response_rows
    ON CONFLICT (check_in_id, topic_id) DO UPDATE SET
      comprehension = EXCLUDED.comprehension;
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
        -- 0-based, cronológico (semana más vieja = 0) — usado para darle a
        -- average_grade una pendiente ascendente deliberada más abajo.
        ROW_NUMBER() OVER (
          PARTITION BY wc.student_id, wc.subject_id
          ORDER BY wc.academic_year, wc.academic_week
        ) - 1 AS week_index,
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
              -- Pendiente ascendente deliberada: -4.5 en la primera semana
              -- hasta +4.5 en la última (16 semanas, índice 0..15), para
              -- que la regresión lineal de "Evolución de mi promedio"
              -- muestre una tendencia ASCENDING clara en vez de ruido plano.
              + ((lc.week_index - 7.5) * 0.6)
              + (((('x' || substr(seed_hash, 11, 2))::bit(8)::int % 7) - 3)::numeric / 5)
            )
          ),
          2
        )::numeric(4,2) AS average_grade,
        lc.task_completion AS compliance_index,
        lc.attendance AS attendance_rate,
        lc.study_hours,
        lc.general_comprehension AS comprehension_avg,
        ((('x' || substr(seed_hash, 3, 2))::bit(8)::int % 9) - 4)::numeric(6,2) / 10 AS trend_slope
      FROM latest_check_ins lc
      LEFT JOIN grade_average ga
        ON ga.student_id = lc.student_id
       AND ga.subject_id = lc.subject_id
    ),

    -- Mismo "piso" que ClassifyRiskUseCase (analytics-service): un promedio
    -- reprobatorio siempre escala al menos a MEDIUM (<14) o HIGH (<10), sin
    -- importar qué tan bien salgan los demás factores. Se calcula por rango
    -- numérico (0=LOW..3=CRITICAL) y se toma el peor de score vs. piso, para
    -- nunca degradar una clasificación que ya era peor.
    metric_rows_ranked AS (
      SELECT
        *,
        CASE
          WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 40 THEN 3
          WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 55 THEN 2
          WHEN ((average_grade * 5) + compliance_index + attendance_rate + comprehension_avg) / 4 < 70 THEN 1
          ELSE 0
        END AS score_rank,
        CASE
          WHEN average_grade < 10 THEN 2
          WHEN average_grade < 14 THEN 1
          ELSE 0
        END AS grade_floor_rank
      FROM metric_rows
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
      CASE GREATEST(score_rank, grade_floor_rank)
        WHEN 3 THEN 'CRITICAL'
        WHEN 2 THEN 'HIGH'
        WHEN 1 THEN 'MEDIUM'
        ELSE 'LOW'
      END,
      trend_slope,
      now()
    FROM metric_rows_ranked
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
