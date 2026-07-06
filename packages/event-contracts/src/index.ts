export const EVENTS = {
  GRADE_RECORDED: 'grade.recorded',
  STUDENT_LOGIN: 'student.login',
  PREDICTION_CREATED: 'prediction.created',
  ENROLLMENT_CHANGED: 'enrollment.changed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface GradeRecordedPayload {
  studentId: string;
  subjectId: string;
  value: number;
  recordedBy: string;
  timestamp: Date;
}

export interface StudentLoginPayload {
  studentId: string;
  occurredAt: Date;
  ip: string;
}

export interface PredictionCreatedPayload {
  predictionId: string;
  studentId: string;
  subjectId: string;
  risk: number;
  modelVersion: string;
  requestedAt: Date;
}

export type EventPayload = {
  [EVENTS.GRADE_RECORDED]: GradeRecordedPayload;
  [EVENTS.STUDENT_LOGIN]: StudentLoginPayload;
  [EVENTS.PREDICTION_CREATED]: PredictionCreatedPayload;
  [EVENTS.ENROLLMENT_CHANGED]: never;
};
