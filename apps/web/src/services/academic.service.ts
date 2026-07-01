import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type { Course } from "@/types/course";

interface SubjectApiResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  credits?: number;
  careerId?: string;
  career_id?: string;
  academicPeriodId?: string;
  academic_period_id?: string;
  maxCapacity?: number;
  max_capacity?: number;
  teacherId?: string | null;
  teacher_id?: string | null;
  teacherName?: string;
  teacher_name?: string;
  isActive?: boolean;
  is_active?: boolean;
}

interface AcademicPeriodApiResponse {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

interface StudentEnrollmentApiResponse {
  id: string;
  studentId?: string;
  student_id?: string;
  subjectId?: string;
  subject_id?: string;
  subjectName?: string;
  subject_name?: string;
  subjectCredits?: number;
  subject_credits?: number;
  periodId?: string;
  period_id?: string;
  status?: string;
}

export interface CourseCareerOption {
  id: string;
  name: string;
  code?: string;
  facultyId: string;
}

export interface CourseFacultyOption {
  id: string;
  name: string;
  code?: string;
}

export interface CoursePeriodOption {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface CreateTeacherCoursePayload {
  name: string;
  code: string;
  description: string;
  credits: number;
  careerId: string;
  academicPeriodId: string;
  maxCapacity: number;
  teacherId: string;
  teacherName?: string;
}

export interface UpdateTeacherCoursePayload {
  name: string;
  description: string;
}

export interface UpdateTeacherCourseResult {
  id: string;
  name: string;
  description: string;
}

export interface ImportGradesResponse {
  imported: number;
  grades: unknown[];
}

interface CareerApiResponse {
  id: string;
  name: string;
  code?: string;
  status?: string;
  facultyId?: string;
  faculty_id?: string;
}

interface FacultyApiResponse {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

interface MaybeWrappedArray<T> {
  value?: T[];
  data?: T[];
  items?: T[];
}

interface RequestCache<T> {
  value?: T;
  expiresAt?: number;
  request?: Promise<T>;
}

const ACADEMIC_CACHE_TTL_MS = 5 * 60 * 1000;

const subjectsCache: RequestCache<SubjectApiResponse[]> = {};
const periodsCache: RequestCache<AcademicPeriodApiResponse[]> = {};
const facultiesCache: RequestCache<FacultyApiResponse[]> = {};
const careersCache: RequestCache<CareerApiResponse[]> = {};

function loadCached<T>(
  cache: RequestCache<T>,
  loader: () => Promise<T>
): Promise<T> {
  if (cache.value && cache.expiresAt && cache.expiresAt > Date.now()) {
    return Promise.resolve(cache.value);
  }

  if (cache.request) {
    return cache.request;
  }

  const request = loader()
    .then((value) => {
      cache.value = value;
      cache.expiresAt = Date.now() + ACADEMIC_CACHE_TTL_MS;
      return value;
    })
    .finally(() => {
      if (cache.request === request) {
        cache.request = undefined;
      }
    });

  cache.request = request;
  return request;
}

function invalidateSubjectsCache() {
  subjectsCache.value = undefined;
  subjectsCache.expiresAt = undefined;
}

function unwrapArray<T>(response: T[] | MaybeWrappedArray<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.value ?? response.data ?? response.items ?? [];
}

function getSubjects() {
  return loadCached(subjectsCache, async () => {
    const response = await api.get<
      SubjectApiResponse[] | MaybeWrappedArray<SubjectApiResponse>
    >(endpoints.academic.subjects);

    return unwrapArray(response.data);
  });
}

function getPeriods() {
  return loadCached(periodsCache, async () => {
    const response = await api.get<
      AcademicPeriodApiResponse[] | MaybeWrappedArray<AcademicPeriodApiResponse>
    >(endpoints.academic.periods);

    return unwrapArray(response.data);
  });
}

function getFaculties() {
  return loadCached(facultiesCache, async () => {
    const response = await api.get<
      FacultyApiResponse[] | MaybeWrappedArray<FacultyApiResponse>
    >(endpoints.academic.faculties);

    return unwrapArray(response.data);
  });
}

function getCareers() {
  return loadCached(careersCache, async () => {
    const response = await api.get<
      CareerApiResponse[] | MaybeWrappedArray<CareerApiResponse>
    >(endpoints.academic.careers);

    return unwrapArray(response.data);
  });
}

function getTeacherName(subject: SubjectApiResponse) {
  const teacherName = subject.teacherName ?? subject.teacher_name;
  const teacherId = subject.teacherId ?? subject.teacher_id;

  if (teacherName) {
    return teacherName;
  }

  if (!teacherId) {
    return "Docente sin asignar";
  }

  return `Docente asignado`;
}

function toCourse(
  subject: SubjectApiResponse,
  periodsById: Map<string, AcademicPeriodApiResponse>,
  teacherNameFallback?: string
): Course {
  const periodId =
    subject.academicPeriodId ?? subject.academic_period_id ?? "";
  const period = periodsById.get(periodId);
  const isActive = subject.isActive ?? subject.is_active ?? true;

  return {
    id: subject.id,
    name: subject.name,
    teacherName: teacherNameFallback ?? getTeacherName(subject),
    semester: period?.name ?? period?.code ?? "Periodo no asignado",
    description: subject.description ?? "Sin descripcion registrada.",
    riskLevel: "LOW",
    riskLabel: isActive ? "Curso activo" : "Curso inactivo",
  };
}

async function getAcademicCourseData() {
  const [subjects, periods] = await Promise.all([getSubjects(), getPeriods()]);
  const periodsById = new Map(periods.map((period) => [period.id, period]));

  return {
    subjects,
    periodsById,
  };
}

export async function getAdminCourses(): Promise<Course[]> {
  const { subjects, periodsById } = await getAcademicCourseData();

  return subjects.map((subject) => toCourse(subject, periodsById));
}

export async function getTeacherCourses(
  teacherId: string,
  teacherName?: string
): Promise<Course[]> {
  const { subjects, periodsById } = await getAcademicCourseData();

  return subjects
    .filter((subject) => {
      const subjectTeacherId = subject.teacherId ?? subject.teacher_id;

      return subjectTeacherId === teacherId;
    })
    .map((subject) =>
      toCourse(subject, periodsById, teacherName)
  );
}

export async function getStudentCourses(studentId: string): Promise<Course[]> {
  const [enrollmentsResponse, periods] = await Promise.all([
    api.get<StudentEnrollmentApiResponse[] | MaybeWrappedArray<StudentEnrollmentApiResponse>>(
      endpoints.academic.enrollments,
      {
        params: {
          studentId,
        },
      }
    ),
    getPeriods(),
  ]);

  const periodsById = new Map(periods.map((period) => [period.id, period]));

  return unwrapArray(enrollmentsResponse.data)
    .filter((enrollment) => !enrollment.status || enrollment.status === "ACTIVE")
    .map((enrollment) => {
      const subjectId = enrollment.subjectId ?? enrollment.subject_id ?? enrollment.id;
      const periodId = enrollment.periodId ?? enrollment.period_id ?? "";
      const period = periodsById.get(periodId);

      return {
        id: subjectId,
        name:
          enrollment.subjectName ??
          enrollment.subject_name ??
          "Curso sin nombre",
        teacherName: "Docente asignado",
        semester: period?.name ?? period?.code ?? "Periodo no asignado",
        description: "Curso matriculado actualmente.",
        riskLevel: "LOW",
        riskLabel: "Curso activo",
      };
    });
}

export async function getCourseCreationOptions(): Promise<{
  faculties: CourseFacultyOption[];
  careers: CourseCareerOption[];
  periods: CoursePeriodOption[];
}> {
  const [loadedFaculties, loadedCareers, loadedPeriods] = await Promise.all([
    getFaculties(),
    getCareers(),
    getPeriods(),
  ]);

  const faculties = loadedFaculties
    .filter((faculty) => !faculty.status || faculty.status === "ACTIVE")
    .map((faculty) => ({
      id: faculty.id,
      name: faculty.name,
      code: faculty.code,
    }));

  const careers = loadedCareers
    .filter(
      (career) =>
        (!career.status || career.status === "ACTIVE") &&
        !!(career.facultyId ?? career.faculty_id)
    )
    .map((career) => ({
      id: career.id,
      name: career.name,
      code: career.code,
      facultyId: career.facultyId ?? career.faculty_id ?? "",
    }));

  const periods = loadedPeriods
    .filter((period) => !period.status || period.status === "ACTIVE")
    .map((period) => ({
      id: period.id,
      name: period.name,
      code: period.code,
      status: period.status,
    }));

  return {
    faculties,
    careers,
    periods,
  };
}

export async function enrollStudentsInCourse(
  subjectId: string,
  studentIds: string[]
): Promise<string[]> {
  const results = await Promise.allSettled(
    studentIds.map((studentId) =>
      api.post(endpoints.academic.enrollments, {
        studentId,
        subjectId,
      })
    )
  );

  return results.flatMap((result, index) =>
    result.status === "rejected" ? [studentIds[index]] : []
  );
}

export async function createTeacherCourse(
  payload: CreateTeacherCoursePayload
): Promise<Course> {
  const response = await api.post<SubjectApiResponse>(
    endpoints.academic.subjects,
    {
      name: payload.name,
      code: payload.code,
      description: payload.description,
      credits: payload.credits,
      careerId: payload.careerId,
      academicPeriodId: payload.academicPeriodId,
      maxCapacity: payload.maxCapacity,
      teacherId: payload.teacherId,
    }
  );

  const periods = await getPeriods();
  const periodsById = new Map(periods.map((period) => [period.id, period]));

  invalidateSubjectsCache();

  return toCourse(response.data, periodsById, payload.teacherName);
}

export async function deleteTeacherCourse(courseId: string): Promise<void> {
  await api.delete(endpoints.academic.subject(courseId));
  invalidateSubjectsCache();
}

export async function updateTeacherCourse(
  courseId: string,
  payload: UpdateTeacherCoursePayload
): Promise<UpdateTeacherCourseResult> {
  const response = await api.put<SubjectApiResponse>(
    endpoints.academic.subject(courseId),
    payload
  );

  invalidateSubjectsCache();

  return {
    id: response.data.id,
    name: response.data.name,
    description: response.data.description ?? "",
  };
}

export async function importGradesFile(
  file: File
): Promise<ImportGradesResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ImportGradesResponse>(
    endpoints.academic.importGrades,
    formData
  );

  return response.data;
}
