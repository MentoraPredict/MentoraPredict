/** Centralized Redis key builders — ensures naming consistency across services */
export const REDIS_KEYS = {
  AUTH: {
    REFRESH_TOKEN:     (userId: string)    => `auth:refresh:${userId}`,
    PW_RESET:          (tokenHash: string) => `auth:pwreset:${tokenHash}`,
    RATE_LIMIT_LOGIN:  (ip: string)        => `auth:ratelimit:login:${ip}`,
  },
  METRICS: {
    STUDENT: (studentId: string, periodId: string) =>
      `metrics:student:${studentId}:${periodId}`,
    SUBJECT: (subjectId: string) => `metrics:subject:${subjectId}`,
  },
  DASHBOARD: {
    STUDENT: (studentId: string) => `dash:student:${studentId}`,
    TEACHER: (teacherId: string) => `dash:teacher:${teacherId}`,
    ADMIN:   ()                  => `dash:admin:global`,
  },
  RISK: {
    STUDENT: (studentId: string, periodId: string) =>
      `risk:student:${studentId}:${periodId}`,
  },
} as const;

/** TTL values in seconds — use with redis.set(key, value, 'EX', TTL) */
export const REDIS_TTL = {
  REFRESH_TOKEN:    604800,  // 7 days
  PW_RESET:         3600,    // 1 hour
  RATE_LIMIT_LOGIN: 900,     // 15 min
  STUDENT_METRICS:  3600,    // 1 hour
  SUBJECT_METRICS:  1800,    // 30 min
  DASH_STUDENT:     900,     // 15 min
  DASH_TEACHER:     1800,    // 30 min
  DASH_ADMIN:       300,     // 5 min
  RISK_STUDENT:     3600,    // 1 hour
} as const;
