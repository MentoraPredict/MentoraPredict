export interface StudentCourseMetric {
  id: string;
  label: string;
  value: string;
}

export interface StudentTopicSurveyItem {
  topicId: string;
  topicTitle: string;
  /** 1 (nada claro) a 5 (muy claro); null si el tema aún no se ha visto. */
  comprehensionLevel: 1 | 2 | 3 | 4 | 5 | null;
}
