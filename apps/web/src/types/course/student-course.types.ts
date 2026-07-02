export interface StudentCourseMetric {
  id: string;
  label: string;
  value: string;
}

export interface StudentTopicSurveyItem {
  topicId: string;
  topicTitle: string;
  comprehensionLevel: 1 | 2 | 3 | 4 | 5;
}
