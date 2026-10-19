-- =====================================================
-- DATOS DE ANALÍTICA DE EJEMPLO
-- Check-ins semanales, métricas por asignatura y predicciones.
--
-- Escala de notas 0-10 (aprobar con 7). Los check-ins se generan por cada
-- matrícula activa desde el inicio del periodo activo hasta hoy (nunca
-- fechas futuras). Todo sale del perfil del estudiante (tabla
-- seed_student_archetypes de 05_people_enrollment.sql): asistencia,
-- cumplimiento, horas de estudio, ánimo y comprensión coinciden con sus notas
-- y faltas reales. average_grade parte del promedio real de la libreta y
-- sigue la tendencia del perfil (recuperación sube, declive baja).
--
-- Necesita los temas del temario (04_structure.sql) y las tablas de
-- referencia (02_user_references.sql, 08_subject_period_references.sql).
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
        a.absent_pct, a.compliance, a.study_hours AS base_hours, a.emotional,
        a.comprehension AS base_comprehension, a.grade_trend,
        w.week_offset,
        md5(ae.student_id::text || ':' || ae.subject_id::text || ':check-in:' || w.week_offset::text) AS seed_hash,
        (ae.period_start_date + (w.week_offset * interval '7 days'))::date AS check_in_date
      FROM active_enrollments ae
      CROSS JOIN weeks w
      JOIN seed_student_profile_map pm ON pm.student_no = right(ae.student_id::text, 3)::int
      JOIN seed_student_archetypes a ON a.code = pm.archetype
      WHERE (ae.period_start_date + (w.week_offset * interval '7 days'))::date <= current_date
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
        LEAST(100, GREATEST(0, 100 - absent_pct + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 7) - 3))::int AS attendance,
        LEAST(100, GREATEST(0, compliance + (('x' || substr(seed_hash, 3, 2))::bit(8)::int % 15) - 7))::int AS task_completion,
        GREATEST(0.5, base_hours + ((('x' || substr(seed_hash, 5, 2))::bit(8)::int % 5) - 2) * 0.3)::numeric(5,2) AS study_hours,
        (ARRAY['CRITICAL','BAD','NEUTRAL','GOOD','GREAT'])[
            LEAST(5, GREATEST(1, emotional + CASE (('x' || substr(seed_hash, 7, 2))::bit(8)::int % 6)
                WHEN 0 THEN -1 WHEN 1 THEN 1 ELSE 0 END))
        ] AS emotional_state,
        LEAST(100, GREATEST(0, base_comprehension
            + (('x' || substr(seed_hash, 9, 2))::bit(8)::int % 13) - 6
            + ROUND(grade_trend * (week_offset - 3) * 3)))::int AS general_comprehension,        seed_hash
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
        COUNT(*) OVER (PARTITION BY wc.student_id, wc.subject_id) - 1 AS last_week_index,
        a.grade_trend,
        md5(wc.student_id::text || ':' || wc.subject_id::text || ':metric:' || wc.academic_week::text) AS seed_hash
      FROM weekly_check_ins wc
      JOIN seed_student_profile_map pm ON pm.student_no = right(wc.student_id::text, 3)::int
      JOIN seed_student_archetypes a ON a.code = pm.archetype
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
            10,
            GREATEST(
              0,
              COALESCE(
                ga.average_grade,
                (5 + (('x' || substr(seed_hash, 1, 2))::bit(8)::int % 4))::numeric
              )
              -- La última semana coincide con el promedio real; hacia atrás se
              -- aplica la tendencia del perfil (recuperación: antes más bajo;
              -- declive: antes más alto).
              + (lc.grade_trend * 0.4 * (lc.week_index - lc.last_week_index))
              + (((('x' || substr(seed_hash, 11, 2))::bit(8)::int % 5) - 2)::numeric / 10)
            )
          ),
          2
        )::numeric(4,2) AS average_grade,
        lc.task_completion AS compliance_index,
        lc.attendance AS attendance_rate,
        lc.study_hours,
        lc.general_comprehension AS comprehension_avg,
        ROUND(lc.grade_trend * 0.4, 2)::numeric(6,2) AS trend_slope
      FROM latest_check_ins lc
      LEFT JOIN grade_average ga
        ON ga.student_id = lc.student_id
       AND ga.subject_id = lc.subject_id
    ),

    -- Mismo "piso" que ClassifyRiskUseCase (analytics-service): un promedio
    -- reprobatorio siempre escala al menos a MEDIUM (<7) o HIGH (<5), sin
    -- importar qué tan bien salgan los demás factores. Se calcula por rango
    -- numérico (0=LOW..3=CRITICAL) y se toma el peor de score vs. piso, para
    -- nunca degradar una clasificación que ya era peor.
    metric_rows_ranked AS (
      SELECT
        *,
        CASE
          WHEN ((average_grade * 10) + compliance_index + attendance_rate + comprehension_avg) / 4 < 40 THEN 3
          WHEN ((average_grade * 10) + compliance_index + attendance_rate + comprehension_avg) / 4 < 55 THEN 2
          WHEN ((average_grade * 10) + compliance_index + attendance_rate + comprehension_avg) / 4 < 70 THEN 1
          ELSE 0
        END AS score_rank,
        CASE
          WHEN average_grade < 5 THEN 2
          WHEN average_grade < 7 THEN 1
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
