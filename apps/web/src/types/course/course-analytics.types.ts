export interface CourseProgressPoint {
  week: string;
  actual: number;
  projection: number;
}

export interface CourseAlert {
  id: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
}

export interface CourseRiskItem {
  id: string;
  label: string;
  value: number;
}
