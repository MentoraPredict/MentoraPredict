import type { Shift } from "./institution-config.types";

export interface GradeLevel {
  code: string;
  levelCode: string;
  levelName: string;
  name: string;
  ordinal: number;
  sortOrder: number;
  isLevelActive: boolean;
  shifts: Shift[];
}

export interface Section {
  id: string;
  schoolYearId: string;
  gradeLevelCode: string;
  name: string;
  shift: Shift;
  capacity: number;
  tutorId: string | null;
  isActive: boolean;
  courseCount: number;
}

export interface CreateSectionPayload {
  schoolYearId: string;
  gradeLevelCode: string;
  name: string;
  shift: Shift;
  capacity: number;
  tutorId?: string | null;
}

export interface UpdateSectionPayload {
  name?: string;
  shift?: Shift;
  capacity?: number;
  tutorId?: string | null;
}

export interface GenerateCoursesResult {
  created: number;
  alreadyOffered: number;
  courses: { id: string; name: string; weeklyHours: number | null }[];
}

export interface CatalogSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  area: string | null;
  isActive: boolean;
}

export interface CreateCatalogSubjectPayload {
  name: string;
  code: string;
  area?: string;
  description?: string;
}

export interface CurriculumItem {
  gradeLevelCode: string;
  subjectCatalogId: string;
  weeklyHours: number;
}
