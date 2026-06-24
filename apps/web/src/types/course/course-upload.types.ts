export interface CourseUploadedFile {
  id: string;
  name: string;
  file: File;
}

export interface GradeEvaluationItem {
  id: string;
  label: string;
  percentage: number;
}

export interface SyllabusTopic {
  id: string;
  title: string;
}

export interface StudentTopicComprehension {
  topicId: string;
  value: 1 | 2 | 3 | 4 | 5;
}
