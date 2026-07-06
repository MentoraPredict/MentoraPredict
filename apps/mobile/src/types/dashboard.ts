import type { SessionUser, UserRole } from '@/types/auth';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
export type NotificationStatus = 'UNREAD' | 'READ';

export interface AppUser extends SessionUser {
  careerName?: string;
  facultyName?: string;
  semester?: string;
}

export interface CourseSummary {
  id: string;
  name: string;
  code?: string;
  description?: string | null;
  semester?: string;
  teacherName?: string | null;
  careerName?: string | null;
  facultyName?: string | null;
  enrolledCount?: number;
  currentAverage?: number | null;
  riskLevel?: RiskLevel | null;
  status?: string;
}

export interface CourseStudent {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  average?: number | null;
  riskLevel?: RiskLevel | null;
  isEnrolled?: boolean;
}

export interface CourseMetric {
  id: string;
  label: string;
  value: string;
}

export interface AppNotification {
  id: string;
  recipientRole?: UserRole;
  type?: string;
  subjectId?: string;
  studentId?: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt?: string;
}

export interface StudentCourseAnalytics {
  average: number | null;
  riskLevel: RiskLevel | null;
  alerts: AppNotification[];
  recommendation?: string | null;
  progress: Array<{ week: string; value: number }>;
}

export interface AdminDashboardData {
  courses: CourseSummary[];
  students: AppUser[];
}

export interface TeacherDashboardData {
  courses: Array<
    CourseSummary & {
      metrics: CourseMetric[];
      students: CourseStudent[];
    }
  >;
}

export interface StudentDashboardData {
  courses: Array<
    CourseSummary & {
      analytics?: StudentCourseAnalytics;
    }
  >;
}
