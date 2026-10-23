export type EmotionalState = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'CRITICAL';

export interface EmotionalSignal {
  emotionalState: EmotionalState;
  academicWeek: number;
  academicYear: number;
}

export interface LoginActivitySignal {
  lastLoginAt: string | null;
  loginCountLast30Days: number;
}

/** Señales de un estudiante que viven en otros servicios (academic y auth). */
export interface IStudentSignalsClient {
  getEmotionalState(
    studentId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<EmotionalSignal | null>;
  getLoginActivity(studentId: string, correlationId?: string): Promise<LoginActivitySignal>;
}