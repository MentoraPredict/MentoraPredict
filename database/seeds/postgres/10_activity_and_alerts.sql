-- =====================================================
-- ACTIVIDAD EN LA PLATAFORMA, ALERTAS, NOTIFICACIONES Y OBSERVACIONES
-- Todo sale de los perfiles de 05_people_enrollment.sql y de las notas de
-- 06_evaluations_grades.sql, para que lo que muestran los paneles
-- (ingresos, advertencias, observaciones) cuente la misma historia que
-- las notas y la asistencia de cada estudiante.
-- Corre después de 09_student_analytics.sql.
-- =====================================================

-- Ingresos a la plataforma ---------------------------------------------------
-- Estudiantes: según su perfil (ingresos por semana y días desde el último
-- ingreso). Docentes, representantes y personal: uso habitual.

WITH people AS (
    SELECT
        u.id AS user_id,
        CASE
            WHEN u.role = 'STUDENT' THEN a.weekly_logins
            WHEN u.role = 'TEACHER' THEN 4
            WHEN u.role = 'GUARDIAN' THEN 1
            ELSE 3
        END AS weekly_logins,
        CASE
            WHEN u.role = 'STUDENT' THEN a.days_since_login
            WHEN u.role = 'GUARDIAN' THEN 3
            ELSE 0
        END AS days_since_login
    FROM users u
    LEFT JOIN seed_student_profile_map pm
           ON u.role = 'STUDENT' AND pm.student_no = right(u.id::text, 3)::int
    LEFT JOIN seed_student_archetypes a ON a.code = pm.archetype
    WHERE u.role <> 'STUDENT' OR a.code IS NOT NULL
),
events AS (
    SELECT
        p.user_id,
        k.k,
        md5('login:' || p.user_id::text || ':' || k.k::text) AS h,
        -- 6 semanas de historial, repartidas de forma pareja.
        date_trunc('day', now())
          - (p.days_since_login + k.k * (42.0 / GREATEST(1, round(p.weekly_logins * 6)))) * interval '1 day' AS day_start
    FROM people p
    CROSS JOIN LATERAL generate_series(0, GREATEST(1, round(p.weekly_logins * 6)::int) - 1) AS k(k)
)
INSERT INTO login_events (id, user_id, occurred_at, login_method, ip_address, user_agent, device_type)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    user_id,
    CASE
        WHEN ts > now() THEN ts - interval '1 day'
        ELSE ts
    END,
    'LOCAL',
    '10.0.' || (('x' || substr(h, 1, 2))::bit(8)::int % 4) || '.' || (10 + ('x' || substr(h, 3, 2))::bit(8)::int % 200),
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 (seed)',
    NULL
FROM (
    SELECT user_id, h,
           day_start + ((7 + (('x' || substr(h, 5, 2))::bit(8)::int % 15)) * interval '1 hour')
                     + ((('x' || substr(h, 7, 2))::bit(8)::int % 60) * interval '1 minute') AS ts
    FROM events
) e
ON CONFLICT (id) DO UPDATE SET occurred_at = EXCLUDED.occurred_at;

-- Alertas de rendimiento ---------------------------------------------------------
-- Dos materias más bajas de cada estudiante en riesgo (una en los casos de
-- faltas y de declive). Se generan sobre las notas reales del seed.

DELETE FROM notifications WHERE related_alert_id IN (
    SELECT id FROM alerts WHERE metadata ->> 'source' = 'seed'
);
DELETE FROM alerts WHERE metadata ->> 'source' = 'seed';

WITH subject_avg AS (
    SELECT
        g.student_id,
        g.subject_id,
        ROUND(AVG(g.value), 2) AS average,
        row_number() OVER (PARTITION BY g.student_id ORDER BY AVG(g.value), g.subject_id) AS rk
    FROM grades g
    GROUP BY g.student_id, g.subject_id
),
targets AS (
    SELECT
        sa.student_id,
        sa.subject_id,
        sa.average,
        pm.archetype,
        sc.name AS subject_name,
        CASE pm.archetype
            WHEN 'RIESGO_CRITICO'    THEN 'RISK_ESCALATION'
            WHEN 'RIESGO_ACADEMICO'  THEN 'RISK_ESCALATION'
            WHEN 'FALTAS_FRECUENTES' THEN 'LOW_ATTENDANCE'
            ELSE 'AVERAGE_DROP'
        END AS alert_type,
        CASE pm.archetype
            WHEN 'RIESGO_CRITICO'   THEN 'CRITICAL'
            WHEN 'RIESGO_ACADEMICO' THEN 'HIGH'
            ELSE 'MEDIUM'
        END AS severity,
        md5('alert:' || sa.student_id::text || ':' || sa.subject_id::text) AS h
    FROM subject_avg sa
    JOIN seed_student_profile_map pm ON pm.student_no = right(sa.student_id::text, 3)::int
    JOIN subjects sj ON sj.id = sa.subject_id
    JOIN subject_catalog sc ON sc.id = sj.subject_catalog_id
    WHERE (pm.archetype IN ('RIESGO_CRITICO', 'RIESGO_ACADEMICO') AND sa.rk <= 2)
       OR (pm.archetype IN ('FALTAS_FRECUENTES', 'DECLIVE') AND sa.rk = 1)
)
INSERT INTO alerts (
    id, student_id, type, message, status, created_at, metadata,
    subject_id, period_id, severity, triggered_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    student_id,
    alert_type,
    CASE alert_type
        WHEN 'RISK_ESCALATION' THEN
            subject_name || ': el promedio es ' || average || ' y está por debajo del mínimo para aprobar. Requiere seguimiento.'
        WHEN 'LOW_ATTENDANCE' THEN
            subject_name || ': las faltas del trimestre se acercan al límite permitido.'
        ELSE
            subject_name || ': el promedio viene bajando en las últimas evaluaciones.'
    END,
    'ACTIVE',
    now() - interval '2 days',
    jsonb_build_object('source', 'seed', 'average', average),
    subject_id,
    'a0000000-2026-4000-8000-0000000000b1',
    severity,
    now() - interval '2 days'
FROM targets
ON CONFLICT (id) DO UPDATE SET
    message = EXCLUDED.message,
    status = EXCLUDED.status,
    severity = EXCLUDED.severity,
    metadata = EXCLUDED.metadata;

-- Notificaciones de esas alertas: al docente de la materia y al estudiante.

INSERT INTO notifications (
    id, recipient_id, recipient_role, type, related_alert_id, subject_id,
    student_id, period_id, title, message, status, created_at
)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    n.recipient_id, n.recipient_role,
    CASE WHEN n.recipient_role = 'TEACHER' THEN 'RISK_ESCALATION' ELSE 'EARLY_ALERT' END,
    n.alert_id, n.subject_id, n.student_id,
    'a0000000-2026-4000-8000-0000000000b1',
    CASE WHEN n.recipient_role = 'TEACHER' THEN 'Estudiante en riesgo en tu materia' ELSE 'Alerta temprana en una de tus materias' END,
    n.message,
    'UNREAD',
    now() - interval '2 days'
FROM (
    SELECT
        al.id AS alert_id, al.subject_id, al.student_id, al.message,
        r.recipient_id, r.recipient_role,
        md5('notification:' || al.id::text || ':' || r.recipient_role) AS h
    FROM alerts al
    JOIN subjects sj ON sj.id = al.subject_id
    CROSS JOIN LATERAL (VALUES
        (sj.teacher_id, 'TEACHER'),
        (al.student_id, 'STUDENT')
    ) AS r(recipient_id, recipient_role)
    WHERE al.metadata ->> 'source' = 'seed'
      AND r.recipient_id IS NOT NULL
) n
ON CONFLICT (id) DO NOTHING;

-- Observaciones del docente -----------------------------------------------------
-- Una por cada alerta, del docente de esa materia.

INSERT INTO teacher_observations (id, student_id, teacher_id, subject_id, type, content, created_at)
SELECT
    (substr(h, 1, 8) || '-' || substr(h, 9, 4) || '-4' || substr(h, 14, 3) || '-8' || substr(h, 18, 3) || '-' || substr(h, 21, 12))::uuid,
    o.student_id, o.teacher_id, o.subject_id, o.type, o.content,
    now() - interval '3 days'
FROM (
    SELECT
        al.student_id,
        sj.teacher_id,
        al.subject_id,
        md5('observation:' || al.student_id::text || ':' || al.subject_id::text) AS h,
        CASE pm.archetype
            WHEN 'FALTAS_FRECUENTES' THEN 'ATTENDANCE'
            WHEN 'DECLIVE' THEN 'PERFORMANCE'
            ELSE 'ACADEMIC'
        END AS type,
        CASE pm.archetype
            WHEN 'RIESGO_CRITICO' THEN 'Falta con frecuencia, casi no entrega tareas y no rindió la prueba del trimestre. Conviene citar al representante y derivar al DECE.'
            WHEN 'RIESGO_ACADEMICO' THEN 'Entiende los temas cuando se le explica en clase, pero no entrega las tareas. Se propone refuerzo semanal.'
            WHEN 'FALTAS_FRECUENTES' THEN 'Buen nivel cuando asiste; las faltas le hacen perder las evaluaciones formativas. Hablar con el representante.'
            ELSE 'Sus notas vienen bajando evaluación a evaluación. Revisar con él o ella si hay algo que le esté afectando.'
        END AS content
    FROM alerts al
    JOIN subjects sj ON sj.id = al.subject_id
    JOIN seed_student_profile_map pm ON pm.student_no = right(al.student_id::text, 3)::int
    WHERE al.metadata ->> 'source' = 'seed'
      AND (al.type <> 'RISK_ESCALATION' OR al.severity IS NOT NULL)
) o
WHERE o.teacher_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;
