import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  AttendanceRule,
  GradingScale,
  Institution,
  InstitutionConfig,
  InstitutionLevel,
  PromotionRule,
} from "@/types/academic/institution-config.types";

export async function getInstitutionConfig(): Promise<InstitutionConfig> {
  const response = await api.get<InstitutionConfig>(
    endpoints.academic.institutionConfig
  );

  return response.data;
}

export async function updateInstitution(
  payload: Omit<Institution, "id">
): Promise<Institution> {
  const response = await api.put<Institution>(
    endpoints.academic.institution,
    payload
  );

  return response.data;
}

export async function updateInstitutionLevels(
  levels: InstitutionLevel[]
): Promise<InstitutionLevel[]> {
  const response = await api.put<InstitutionLevel[]>(
    endpoints.academic.institutionLevels,
    { levels }
  );

  return response.data;
}

export async function updateGradingScale(
  payload: Omit<GradingScale, "id">
): Promise<GradingScale> {
  const response = await api.put<GradingScale>(
    endpoints.academic.gradingScale,
    payload
  );

  return response.data;
}

export async function updateAttendanceRule(
  payload: AttendanceRule
): Promise<AttendanceRule> {
  const response = await api.put<AttendanceRule>(
    endpoints.academic.attendanceRule,
    payload
  );

  return response.data;
}

export async function updatePromotionRules(
  rules: PromotionRule[]
): Promise<PromotionRule[]> {
  const response = await api.put<PromotionRule[]>(
    endpoints.academic.promotionRules,
    { rules }
  );

  return response.data;
}
