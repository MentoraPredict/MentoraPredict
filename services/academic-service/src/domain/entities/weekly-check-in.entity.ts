export type EmotionalState = "GREAT" | "GOOD" | "NEUTRAL" | "BAD" | "CRITICAL";

export interface TopicResponse {
  topicId: string;
  comprehension: number;
}

export class WeeklyCheckInEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly periodId: string,
    public readonly academicWeek: number,
    public readonly academicYear: number,
    public readonly checkInDate: Date,
    public attendance: boolean,
    public taskCompletion: number,
    public studyHours: number,
    public emotionalState: EmotionalState,
    public generalComprehension: number,
    public topicResponses: TopicResponse[],
    public notes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  applyPartialUpdate(data: {
    attendance?: boolean;
    taskCompletion?: number;
    studyHours?: number;
    emotionalState?: EmotionalState;
    generalComprehension?: number;
    topicResponses?: TopicResponse[];
    notes?: string | null;
  }): void {
    if (data.attendance !== undefined) this.attendance = data.attendance;
    if (data.taskCompletion !== undefined) this.taskCompletion = data.taskCompletion;
    if (data.studyHours !== undefined) this.studyHours = data.studyHours;
    if (data.emotionalState !== undefined) this.emotionalState = data.emotionalState;
    if (data.generalComprehension !== undefined) this.generalComprehension = data.generalComprehension;
    if (data.topicResponses !== undefined) this.topicResponses = data.topicResponses;
    if (data.notes !== undefined) this.notes = data.notes;
    this.updatedAt = new Date();
  }
}
