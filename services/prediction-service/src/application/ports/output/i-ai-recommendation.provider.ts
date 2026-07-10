import { RecommendationItem } from '../../../domain/entities/prediction-result.entity';

export interface AiRecommendationRequest {
  studentId: string;
  risk: {
    riskLevel: string;
    globalAverage: number;
    complianceIndex: number;
    attendance: number;
    failedEvaluations: number;
    trendSlope: number;
  };
  subjects: Array<{ name: string; currentGrade: number | null; credits: number }>;
  // Present only for a subject-scoped request — the syllabus unit titles for
  // the ONE subject in focus (subjects will contain a single entry too).
  topics?: string[];
}

export interface AiRecommendationResult {
  summary: string;
  recommendations: RecommendationItem[];
}

export interface IAiRecommendationProvider {
  generate(input: AiRecommendationRequest): Promise<AiRecommendationResult>;
}
