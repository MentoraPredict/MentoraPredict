import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type { Course } from "@/types/course";
import type { CourseEnrolledStudent } from "@/types/course";

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
  imageUrl?: string | null;
  image_url?: string | null;
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

interface StudentSubjectApiResponse {
  enrollmentId: string;
  subjectId: string;
  name: string;
  code: string;
  description?: string | null;
  imageUrl?: string | null;
  credits: number;
  maxCapacity: number;
  teacherId?: string | null;
  teacherName?: string | null;
  periodId: string;
  periodName: string;
  careerId: string;
  careerName: string;
  status: string;
  enrolledAt: string;
  currentAverage?: number | null;
  riskLevel?: "HIGH" | "MEDIUM" | "LOW" | null;
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
    imageUrl: subject.imageUrl ?? subject.image_url ?? undefined,
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

export async function getStudentCourses(): Promise<Course[]> {
  const [response, careers, faculties] = await Promise.all([
    api.get<
      StudentSubjectApiResponse[] | MaybeWrappedArray<StudentSubjectApiResponse>
    >(endpoints.academic.studentSubjects, {
      params: {
        status: "ACTIVE",
        page: 1,
        limit: 100,
      },
    }),
    getCareers(),
    getFaculties(),
  ]);

  const careersById = new Map(careers.map((career) => [career.id, career]));
  const facultiesById = new Map(
    faculties.map((faculty) => [faculty.id, faculty])
  );

  return unwrapArray(response.data).map((subject) => {
    const career = careersById.get(subject.careerId);
    const facultyId = career?.facultyId ?? career?.faculty_id;
    const faculty = facultyId ? facultiesById.get(facultyId) : undefined;

    return {
      id: subject.subjectId,
      name: subject.name,
      teacherName: subject.teacherName ?? "Docente sin asignar",
      semester: subject.periodName,
      description: subject.description ?? "Sin descripcion registrada.",
      imageUrl: subject.imageUrl ?? undefined,
      riskLevel: subject.riskLevel ?? "UNKNOWN",
      riskLabel: subject.riskLevel
        ? `Riesgo ${subject.riskLevel.toLowerCase()}`
        : "Sin datos de riesgo",
      credits: subject.credits,
      careerId: subject.careerId,
      careerName: career?.name ?? subject.careerName,
      facultyId,
      facultyName: faculty?.name,
      currentAverage: subject.currentAverage ?? null,
    };
  });
}

interface EnrichedSubjectEnrollmentApiResponse {
  enrollmentId: string;
  studentId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  status: string;
  enrolledAt: string;
  currentAverage?: number | null;
  riskLevel?: "HIGH" | "MEDIUM" | "LOW" | null;
}

interface BatchEnrollApiResponse {
  enrolled: string[];
  skipped: string[];
  failed: Array<{ studentId: string; reason: string }>;
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
  const response = await api.post<BatchEnrollApiResponse>(
    endpoints.academic.batchEnrollments(subjectId),
    { studentIds },
  );

  return [
    ...response.data.skipped,
    ...response.data.failed.map((failure) => failure.studentId),
  ];
}

export async function getCourseEnrolledStudents(
  subjectId: string
): Promise<CourseEnrolledStudent[]> {
  const loadByStatus = (status: "ACTIVE" | "WITHDRAWN") =>
    api.get<
      EnrichedSubjectEnrollmentApiResponse[] |
        MaybeWrappedArray<EnrichedSubjectEnrollmentApiResponse>
    >(endpoints.academic.subjectEnrollments(subjectId), {
      params: { status, page: 1, limit: 100 },
    });

  const [activeResponse, withdrawnResponse] = await Promise.all([
    loadByStatus("ACTIVE"),
    loadByStatus("WITHDRAWN"),
  ]);

  return [
    ...unwrapArray(activeResponse.data),
    ...unwrapArray(withdrawnResponse.data),
  ]
    .map((enrollment) => ({
      id: enrollment.enrollmentId,
      user: {
        id: enrollment.studentId,
        email: enrollment.email ?? "",
        firstName: enrollment.firstName ?? undefined,
        lastName: enrollment.lastName ?? undefined,
        role: "STUDENT",
        isActive: enrollment.status === "ACTIVE",
      },
      average: enrollment.currentAverage ?? null,
      attendance: null,
      isEnrolled: enrollment.status === "ACTIVE",
    }));
}

export async function updateCourseEnrollmentStatus(
  enrollmentId: string,
  status: "ACTIVE" | "WITHDRAWN"
): Promise<void> {
  await api.patch(endpoints.academic.enrollmentStatus(enrollmentId), { status });
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

export async function uploadTeacherCourseImage(courseId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<SubjectApiResponse>(
    endpoints.academic.subjectImage(courseId),
    formData,
  );
  invalidateSubjectsCache();
  return response.data.imageUrl ?? response.data.image_url ?? undefined;
}

export async function deleteTeacherCourseImage(courseId: string) {
  await api.delete(endpoints.academic.subjectImage(courseId));
  invalidateSubjectsCache();
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
