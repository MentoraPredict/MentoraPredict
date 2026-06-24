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
}

export interface AiRecommendationResult {
  summary: string;
  recommendations: RecommendationItem[];
}

export interface IAiRecommendationProvider {
  generate(input: AiRecommendationRequest): Promise<AiRecommendationResult>;
}
