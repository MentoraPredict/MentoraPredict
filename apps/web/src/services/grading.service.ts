import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  ActivityPayload,
  GradeActivity,
  GradeEntry,
  Gradebook,
  GradingComponent,
  MyGradeBreakdown,
  PeriodClosure,
  PromotionConfirmResult,
  PromotionDecisionPayload,
  SaveGradesResult,
  SectionPromotionRow,
  StudentResults,
  SupplementaryCandidate,
} from "@/types/academic/grading.types";

export async function getGradingComponents(): Promise<GradingComponent[]> {
  const response = await api.get<GradingComponent[]>(
    endpoints.academic.gradingComponents
  );

  return response.data;
}

export async function saveGradingComponents(
  components: Pick<GradingComponent, "code" | "name" | "weight">[]
): Promise<GradingComponent[]> {
  const response = await api.put<GradingComponent[]>(
    endpoints.academic.gradingComponents,
    { components }
  );

  return response.data;
}

export async function getGradebook(
  subjectId: string,
  periodId?: string
): Promise<Gradebook> {
  const response = await api.get<Gradebook>(
    endpoints.academic.subjectGradebook(subjectId),
    { params: periodId ? { periodId } : undefined }
  );

  return response.data;
}

export async function saveGrades(
  subjectId: string,
  periodId: string,
  entries: GradeEntry[]
): Promise<SaveGradesResult> {
  const response = await api.put<SaveGradesResult>(
    endpoints.academic.gradebookGrades(subjectId),
    { periodId, entries }
  );

  return response.data;
}

export async function createActivity(
  subjectId: string,
  payload: ActivityPayload
): Promise<void> {
  await api.post(endpoints.academic.subjectActivities(subjectId), payload);
}

export async function updateActivity(
  activityId: string,
  payload: Partial<Pick<ActivityPayload, "name" | "componentCode" | "dueDate">>
): Promise<GradeActivity> {
  const response = await api.put<GradeActivity>(
    endpoints.academic.activity(activityId),
    payload
  );

  return response.data;
}

export async function setActivityActive(
  activityId: string,
  isActive: boolean
): Promise<void> {
  await api.patch(endpoints.academic.activityStatus(activityId), { isActive });
}

export async function getPeriodClosure(periodId: string): Promise<PeriodClosure> {
  const response = await api.get<PeriodClosure>(
    endpoints.academic.periodClosure(periodId)
  );

  return response.data;
}

export async function closePeriod(
  periodId: string,
  allowIncomplete: boolean
): Promise<void> {
  await api.post(endpoints.academic.closePeriod(periodId), { allowIncomplete });
}

export async function reopenPeriod(
  periodId: string,
  reason: string
): Promise<void> {
  await api.post(endpoints.academic.reopenPeriod(periodId), { reason });
}

export async function getStudentResults(
  studentId: string,
  schoolYearId?: string
): Promise<StudentResults> {
  const response = await api.get<StudentResults>(
    endpoints.academic.studentResults(studentId),
    { params: schoolYearId ? { schoolYearId } : undefined }
  );

  return response.data;
}

export async function getSupplementaryCandidates(
  subjectId: string
): Promise<SupplementaryCandidate[]> {
  const response = await api.get<SupplementaryCandidate[]>(
    endpoints.academic.subjectSupplementary(subjectId)
  );

  return response.data;
}

export async function saveSupplementary(
  subjectId: string,
  entries: { studentId: string; value: number }[]
): Promise<void> {
  await api.put(endpoints.academic.subjectSupplementary(subjectId), { entries });
}

export async function getSectionPromotion(
  sectionId: string
): Promise<SectionPromotionRow[]> {
  const response = await api.get<SectionPromotionRow[]>(
    endpoints.academic.sectionPromotion(sectionId)
  );

  return response.data;
}

export async function confirmPromotion(
  sectionId: string,
  decisions: PromotionDecisionPayload[]
): Promise<PromotionConfirmResult[]> {
  const response = await api.post<PromotionConfirmResult[]>(
    endpoints.academic.sectionPromotion(sectionId),
    { decisions }
  );

  return response.data;
}

/** Cómo se forma la nota del periodo del propio estudiante en una materia. */
export async function getMyGradeBreakdown(
  subjectId: string
): Promise<MyGradeBreakdown> {
  const response = await api.get<MyGradeBreakdown>(
    endpoints.academic.myGradeBreakdown(subjectId)
  );

  return response.data;
}
