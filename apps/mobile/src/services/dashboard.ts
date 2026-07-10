import { requestJson, unwrapArray } from '@/services/api/client';
import type { AuthTokens } from '@/types/auth';
import type {
  AdminDashboardData,
  AppNotification,
  AppUser,
  CourseMetric,
  CourseStudent,
  CourseSummary,
  RiskLevel,
  StudentCourseAnalytics,
  StudentDashboardData,
  TeacherDashboardData,
} from '@/types/dashboard';

interface MaybePaginated<T> {
  data?: T[];
  items?: T[];
  value?: T[];
}

interface UserResponse {
  id: string;
  email?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  isActive?: boolean;
  is_active?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  careerName?: string;
  facultyName?: string;
  semester?: string;
}

interface SubjectResponse {
  id?: string;
  subjectId?: string;
  subject_id?: string;
  name: string;
  code?: string;
  description?: string | null;
  status?: string;
  currentAverage?: number | null;
  current_average?: number | null;
  riskLevel?: RiskLevel | null;
  risk_level?: RiskLevel | null;
  enrolledCount?: number;
  enrolled_count?: number;
  teacherName?: string | null;
  teacher_name?: string | null;
  careerName?: string | null;
  career_name?: string | null;
  facultyName?: string | null;
  faculty_name?: string | null;
  periodName?: string;
  period?: { name?: string; code?: string };
  career?: { name?: string };
  faculty?: { name?: string };
  enrolledAt?: string;
}

interface StudentEnrollmentResponse {
  enrollmentId?: string;
  studentId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  status?: string;
  currentAverage?: number | null;
  current_average?: number | null;
  riskLevel?: RiskLevel | null;
  risk_level?: RiskLevel | null;
}

interface RiskSummaryResponse {
  LOW?: number;
  MEDIUM?: number;
  HIGH?: number;
  CRITICAL?: number;
  unclassified?: number;
}

interface SubjectMetricResponse {
  id: string;
  academicWeek: number;
  averageGrade: number | null;
  riskLevel?: RiskLevel | null;
}

interface SubjectRiskResponse {
  riskLevel: RiskLevel | null;
  factors?: {
    averageGrade?: number | null;
  };
}

interface AlertResponse {
  id: string;
  title?: string;
  message: string;
  status?: 'UNREAD' | 'READ';
  severity?: string | null;
  createdAt?: string;
}

interface PredictionResponse {
  id: string;
  recommendation?: string | null;
  predictedRiskLevel?: RiskLevel | null;
}

function toUser(user: UserResponse): AppUser {
  return {
    id: user.id,
    email: user.email ?? 'Sin correo registrado',
    firstName: user.firstName ?? user.first_name,
    lastName: user.lastName ?? user.last_name,
    role: user.role ?? 'STUDENT',
    isActive: user.isActive ?? user.is_active ?? user.status !== 'INACTIVE',
    careerName: user.careerName,
    facultyName: user.facultyName,
    semester: user.semester,
  };
}

function toCourse(subject: SubjectResponse): CourseSummary {
  const subjectId = subject.subjectId ?? subject.subject_id ?? subject.id ?? '';

  return {
    id: subjectId,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    status: subject.status,
    semester: subject.periodName ?? subject.period?.name ?? subject.period?.code,
    teacherName: subject.teacherName ?? subject.teacher_name,
    careerName: subject.careerName ?? subject.career_name ?? subject.career?.name,
    facultyName: subject.facultyName ?? subject.faculty_name ?? subject.faculty?.name,
    enrolledCount: subject.enrolledCount ?? subject.enrolled_count,
    currentAverage: subject.currentAverage ?? subject.current_average ?? null,
    riskLevel: subject.riskLevel ?? subject.risk_level ?? 'UNKNOWN',
  };
}

function toStudent(enrollment: StudentEnrollmentResponse): CourseStudent {
  return {
    id: enrollment.studentId,
    email: enrollment.email ?? 'Sin correo registrado',
    firstName: enrollment.firstName ?? undefined,
    lastName: enrollment.lastName ?? undefined,
    average: enrollment.currentAverage ?? enrollment.current_average ?? null,
    riskLevel: enrollment.riskLevel ?? enrollment.risk_level ?? 'UNKNOWN',
    isEnrolled: enrollment.status !== 'WITHDRAWN',
  };
}

function toNotification(alert: AlertResponse): AppNotification {
  return {
    id: alert.id,
    title: alert.title ?? 'Alerta academica',
    message: alert.message,
    status: alert.status ?? 'UNREAD',
    createdAt: alert.createdAt,
  };
}

function formatAverage(value?: number | null) {
  if (value === undefined || value === null) return 'Sin datos';
  return `${Number(value).toFixed(2)} / 20`;
}

function buildTeacherMetrics(
  course: CourseSummary,
  summary?: RiskSummaryResponse,
): CourseMetric[] {
  const high = (summary?.HIGH ?? 0) + (summary?.CRITICAL ?? 0);
  return [
    { id: 'students', label: 'Estudiantes', value: String(course.enrolledCount ?? 0) },
    { id: 'average', label: 'Promedio', value: formatAverage(course.currentAverage) },
    { id: 'high', label: 'Riesgo alto', value: String(high) },
    { id: 'medium', label: 'Riesgo medio', value: String(summary?.MEDIUM ?? 0) },
  ];
}

function getCourseAverageFromStudents(students: CourseStudent[]) {
  const averages = students
    .map((student) => student.average)
    .filter((average): average is number => typeof average === 'number');

  if (averages.length === 0) {
    return null;
  }

  return averages.reduce((total, average) => total + average, 0) / averages.length;
}

async function getSubjectAnalytics(
  subjectId: string,
  tokens: AuthTokens,
): Promise<StudentCourseAnalytics> {
  const [metricsResult, riskResult, alertsResult, predictionResult] = await Promise.allSettled([
    requestJson<MaybePaginated<SubjectMetricResponse>>(
      `/v1/analytics/students/me/subjects/${subjectId}/metrics`,
      { tokens, params: { page: 1, limit: 20 } },
    ),
    requestJson<SubjectRiskResponse>(`/v1/analytics/students/me/subjects/${subjectId}/risk`, {
      tokens,
    }),
    requestJson<MaybePaginated<AlertResponse>>('/v1/analytics/students/me/alerts', {
      tokens,
      params: { subjectId, page: 1, limit: 20 },
    }),
    requestJson<PredictionResponse | null>(
      `/v1/prediction/students/me/subjects/${subjectId}/prediction`,
      { tokens },
    ),
  ]);

  const metrics =
    metricsResult.status === 'fulfilled' ? unwrapArray(metricsResult.value) : [];
  const latest = metrics[0];
  const risk = riskResult.status === 'fulfilled' ? riskResult.value : null;
  const alerts =
    alertsResult.status === 'fulfilled' ? unwrapArray(alertsResult.value).map(toNotification) : [];
  const prediction = predictionResult.status === 'fulfilled' ? predictionResult.value : null;

  return {
    average: latest?.averageGrade ?? risk?.factors?.averageGrade ?? null,
    riskLevel: prediction?.predictedRiskLevel ?? risk?.riskLevel ?? latest?.riskLevel ?? 'UNKNOWN',
    alerts,
    recommendation: prediction?.recommendation,
    progress: [...metrics].reverse().map((metric) => ({
      week: `S${metric.academicWeek}`,
      value: metric.averageGrade ?? 0,
    })),
  };
}

export async function getAdminDashboard(tokens: AuthTokens): Promise<AdminDashboardData> {
  const [usersResponse, coursesResponse] = await Promise.all([
    requestJson<UserResponse[] | MaybePaginated<UserResponse>>('/v1/users', {
      tokens,
      params: { role: 'STUDENT', status: 'ACTIVE' },
    }),
    requestJson<SubjectResponse[] | MaybePaginated<SubjectResponse>>('/v1/academic/subjects', {
      tokens,
      params: { page: 1, limit: 100 },
    }),
  ]);

  return {
    students: unwrapArray(usersResponse).map(toUser).filter((user) => user.role === 'STUDENT'),
    courses: unwrapArray(coursesResponse).map(toCourse).filter((course) => course.id),
  };
}

export async function getTeacherDashboard(tokens: AuthTokens): Promise<TeacherDashboardData> {
  const subjectsResponse = await requestJson<SubjectResponse[] | MaybePaginated<SubjectResponse>>(
    '/v1/academic/teachers/me/subjects',
    { tokens, params: { page: 1, limit: 100 } },
  );

  const courses = await Promise.all(
    unwrapArray(subjectsResponse).map(async (subject) => {
      const course = toCourse(subject);
      if (!course.id) {
        return null;
      }
      const [studentsResult, summaryResult] = await Promise.allSettled([
        requestJson<StudentEnrollmentResponse[] | MaybePaginated<StudentEnrollmentResponse>>(
          `/v1/academic/subjects/${course.id}/enrollments`,
          { tokens, params: { status: 'ACTIVE', page: 1, limit: 100 } },
        ),
        requestJson<RiskSummaryResponse>(`/v1/analytics/subjects/${course.id}/metrics/summary`, {
          tokens,
        }),
      ]);
      const students =
        studentsResult.status === 'fulfilled'
          ? unwrapArray(studentsResult.value).map(toStudent)
          : [];
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : undefined;
      const derivedAverage = course.currentAverage ?? getCourseAverageFromStudents(students);
      const enrichedCourse = {
        ...course,
        currentAverage: derivedAverage,
        enrolledCount: course.enrolledCount ?? students.length,
      };

      return {
        ...enrichedCourse,
        metrics: buildTeacherMetrics(enrichedCourse, summary),
        students,
      };
    }),
  );

  return { courses: courses.filter((course): course is NonNullable<typeof course> => Boolean(course)) };
}

export async function getStudentDashboard(tokens: AuthTokens): Promise<StudentDashboardData> {
  const subjectsResponse = await requestJson<SubjectResponse[] | MaybePaginated<SubjectResponse>>(
    '/v1/academic/students/me/subjects',
    { tokens, params: { status: 'ACTIVE', page: 1, limit: 100 } },
  );

  const courses = await Promise.all(
    unwrapArray(subjectsResponse).map(async (subject) => {
      const course = toCourse(subject);
      if (!course.id) {
        return null;
      }
      const analytics = await getSubjectAnalytics(course.id, tokens).catch(() => undefined);
      return { ...course, analytics };
    }),
  );

  return { courses: courses.filter((course): course is NonNullable<typeof course> => Boolean(course)) };
}

export async function getNotifications(tokens: AuthTokens): Promise<AppNotification[]> {
  const [unread, read] = await Promise.allSettled([
    requestJson<MaybePaginated<AlertResponse>>('/v1/notifications/me', {
      tokens,
      params: { status: 'UNREAD', page: 1, limit: 20 },
    }),
    requestJson<MaybePaginated<AlertResponse>>('/v1/notifications/me', {
      tokens,
      params: { status: 'READ', page: 1, limit: 20 },
    }),
  ]);

  return [
    ...(unread.status === 'fulfilled' ? unwrapArray(unread.value) : []),
    ...(read.status === 'fulfilled' ? unwrapArray(read.value) : []),
  ].map(toNotification);
}
