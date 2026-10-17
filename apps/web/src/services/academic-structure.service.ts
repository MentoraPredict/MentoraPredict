import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  CatalogSubject,
  CreateCatalogSubjectPayload,
  CreateSectionPayload,
  CurriculumItem,
  GenerateCoursesResult,
  GradeLevel,
  Section,
  UpdateSectionPayload,
} from "@/types/academic/academic-structure.types";

interface MaybeWrappedArray<T> {
  value?: T[];
  data?: T[];
  items?: T[];
}

function unwrapArray<T>(response: T[] | MaybeWrappedArray<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.value ?? response.data ?? response.items ?? [];
}

export async function getGradeLevels(): Promise<GradeLevel[]> {
  const response = await api.get<GradeLevel[]>(endpoints.academic.gradeLevels);

  return response.data;
}

export async function getSections(schoolYearId: string): Promise<Section[]> {
  const response = await api.get<Section[]>(endpoints.academic.sections, {
    params: { schoolYearId },
  });

  return response.data;
}

export async function createSection(
  payload: CreateSectionPayload
): Promise<Section> {
  const response = await api.post<Section>(
    endpoints.academic.sections,
    payload
  );

  return response.data;
}

export async function updateSection(
  id: string,
  payload: UpdateSectionPayload
): Promise<Section> {
  const response = await api.put<Section>(
    endpoints.academic.section(id),
    payload
  );

  return response.data;
}

export async function deleteSection(id: string): Promise<void> {
  await api.delete(endpoints.academic.section(id));
}

export async function generateSectionCourses(
  id: string
): Promise<GenerateCoursesResult> {
  const response = await api.post<GenerateCoursesResult>(
    endpoints.academic.sectionGenerateCourses(id)
  );

  return response.data;
}

export interface SectionCourse {
  id: string;
  name: string;
  code: string;
  teacherId: string | null;
}

export async function getSectionCourses(
  sectionId: string
): Promise<SectionCourse[]> {
  const response = await api.get<SectionCourse[]>(
    endpoints.academic.sectionCourses(sectionId)
  );

  return response.data;
}

export async function assignCourseTeacher(
  subjectId: string,
  teacherId: string | null
): Promise<void> {
  await api.patch(endpoints.academic.subjectTeacher(subjectId), { teacherId });
}

export async function getSubjectCatalog(): Promise<CatalogSubject[]> {
  const response = await api.get<
    CatalogSubject[] | MaybeWrappedArray<CatalogSubject>
  >(endpoints.academic.subjectCatalog);

  return unwrapArray(response.data);
}

export async function createCatalogSubject(
  payload: CreateCatalogSubjectPayload
): Promise<CatalogSubject> {
  const response = await api.post<CatalogSubject>(
    endpoints.academic.subjectCatalog,
    payload
  );

  return response.data;
}

export async function updateCatalogSubject(
  id: string,
  payload: Partial<Pick<CatalogSubject, "name" | "area" | "description" | "isActive">>
): Promise<CatalogSubject> {
  const response = await api.put<CatalogSubject>(
    endpoints.academic.subjectCatalogItem(id),
    payload
  );

  return response.data;
}

export async function getCurriculum(
  gradeLevelCode: string
): Promise<CurriculumItem[]> {
  const response = await api.get<CurriculumItem[]>(
    endpoints.academic.gradeLevelCurriculum(gradeLevelCode)
  );

  return response.data;
}

export async function setCurriculum(
  gradeLevelCode: string,
  items: { subjectCatalogId: string; weeklyHours: number }[]
): Promise<CurriculumItem[]> {
  const response = await api.put<CurriculumItem[]>(
    endpoints.academic.gradeLevelCurriculum(gradeLevelCode),
    { items }
  );

  return response.data;
}
