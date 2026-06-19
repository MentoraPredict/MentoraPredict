// Local re-export of shared constants (until workspace linking is set up)
export const REDIS_TTL = {
  REFRESH_TOKEN:    604800,
  PW_RESET:         3600,
  RATE_LIMIT_LOGIN: 900,
  STUDENT_METRICS:  3600,
  SUBJECT_METRICS:  1800,
  DASH_STUDENT:     900,
  DASH_TEACHER:     1800,
  DASH_ADMIN:       300,
  RISK_STUDENT:     3600,
} as const;
