import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SessionSummary } from '@/components/auth/SessionSummary';
import { AppButton } from '@/components/ui/AppButton';
import {
  DashboardSection,
  EmptyState,
  MetricCard,
  RiskBadge,
  getRiskTone,
} from '@/components/dashboard/DashboardPrimitives';
import {
  getAdminDashboard,
  getNotifications,
  getStudentDashboard,
  getTeacherDashboard,
} from '@/services/dashboard';
import type { AuthTokens, SessionUser } from '@/types/auth';
import type {
  AdminDashboardData,
  AppNotification,
  AppUser,
  CourseStudent,
  CourseSummary,
  StudentDashboardData,
  TeacherDashboardData,
} from '@/types/dashboard';

type WorkspacePanel = 'dashboard' | 'profile' | 'notifications';

interface RoleWorkspaceProps {
  onLogout: () => void;
  tokens: AuthTokens;
  user: SessionUser;
}

const PAGE_SIZE = 5;

function formatAverage(value?: number | null) {
  if (value === undefined || value === null) return 'Sin datos';
  return `${Number(value).toFixed(2)} / 10`;
}

function displayName(user: { email: string; firstName?: string; lastName?: string }) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
}

function getRoleLabel(role: SessionUser['role']) {
  if (role === 'ADMIN') return 'administrativo';
  if (role === 'TEACHER') return 'docente';
  return 'estudiante';
}

function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  return {
    page: safePage,
    totalPages,
    rows: items.slice(start, start + PAGE_SIZE),
  };
}

function isCourseStudent(student: AppUser | CourseStudent): student is CourseStudent {
  return 'average' in student || 'riskLevel' in student || 'isEnrolled' in student;
}

function getStudentMeta(student: AppUser | CourseStudent) {
  if (isCourseStudent(student)) {
    return `Promedio ${formatAverage(student.average)}`;
  }

  return [student.facultyName, student.careerName, student.semester].filter(Boolean).join(' - ') || 'Activo';
}

function getRiskLabel(riskLevel?: string | null) {
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') return 'Alto';
  if (riskLevel === 'MEDIUM') return 'Medio';
  if (riskLevel === 'LOW') return 'Bajo';
  return 'Sin datos';
}

function PanelSwitcher({
  activePanel,
  onChange,
  unreadCount,
  user,
}: {
  activePanel: WorkspacePanel;
  onChange: (panel: WorkspacePanel) => void;
  unreadCount: number;
  user: SessionUser;
}) {
  const initials = displayName(user)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = user.avatarUrl ?? user.photo;

  return (
    <View style={styles.iconActions}>
      {activePanel !== 'dashboard' ? (
        <Pressable
          accessibilityLabel="Volver al panel principal"
          onPress={() => onChange('dashboard')}
          style={styles.panelButton}>
          <Text style={styles.panelButtonText}>Panel</Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityLabel="Abrir notificaciones"
        onPress={() => onChange('notifications')}
        style={[styles.iconButton, activePanel === 'notifications' && styles.activeIconButton]}>
        <Text style={[styles.bellIcon, activePanel === 'notifications' && styles.activeIconText]}>🔔</Text>
        {unreadCount > 0 ? <Text style={styles.bellCount}>{unreadCount}</Text> : null}
      </Pressable>

      <Pressable
        accessibilityLabel="Abrir perfil"
        onPress={() => onChange('profile')}
        style={[styles.profileButton, activePanel === 'profile' && styles.activeProfileButton]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
        ) : (
          <Text style={[styles.profileInitials, activePanel === 'profile' && styles.activeIconText]}>
            {initials || 'U'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function CourseHeader({ course }: { course: CourseSummary }) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleGroup}>
        <Text style={styles.cardTitle}>{course.name}</Text>
        <Text style={styles.cardSubtitle}>
          {[course.code, course.semester].filter(Boolean).join(' - ') || 'Materia activa'}
        </Text>
      </View>
      <RiskBadge riskLevel={course.riskLevel} />
    </View>
  );
}

function StudentTable({
  students,
  title = 'Estudiantes',
}: {
  students: Array<AppUser | CourseStudent>;
  title?: string;
}) {
  const [page, setPage] = useState(1);
  const { rows, totalPages } = paginate(students, page);

  useEffect(() => {
    setPage(1);
  }, [students.length]);

  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeaderBar}>
        <Text style={styles.tableTitle}>{title}</Text>
        <Text style={styles.tableCounter}>
          {students.length} registro{students.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.tableNameColumn]}>Nombre</Text>
        <Text style={[styles.tableHeaderText, styles.tableRoleColumn]}>Rol</Text>
        <Text style={[styles.tableHeaderText, styles.tableRiskColumn]}>Riesgo</Text>
        <Text style={[styles.tableHeaderText, styles.tableMetaColumn]}>Detalle</Text>
      </View>

      {rows.length === 0 ? (
        <EmptyState message="No hay estudiantes para mostrar." />
      ) : (
        rows.map((student) => (
          <View key={student.id} style={styles.tableRow}>
            <View style={styles.tableNameColumn}>
              <Text style={styles.tablePrimary}>{displayName(student)}</Text>
              <Text style={styles.tableSecondary}>{student.email}</Text>
            </View>
            <Text style={[styles.tableCell, styles.tableRoleColumn]}>
              {'role' in student ? student.role : 'STUDENT'}
            </Text>
            <View style={styles.tableRiskColumn}>
              {isCourseStudent(student) ? (
                <View style={[styles.riskPill, riskPillStyles[getRiskTone(student.riskLevel)]]}>
                  <Text style={styles.riskPillText}>{getRiskLabel(student.riskLevel)}</Text>
                </View>
              ) : (
                <Text style={styles.tableCell}>-</Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.tableMetaColumn]}>{getStudentMeta(student)}</Text>
          </View>
        ))
      )}

      <View style={styles.pagination}>
        <Pressable
          disabled={page <= 1}
          onPress={() => setPage((current) => Math.max(1, current - 1))}
          style={[styles.pageButton, page <= 1 && styles.disabledButton]}>
          <Text style={styles.pageButtonText}>Anterior</Text>
        </Pressable>
        <Text style={styles.pageText}>
          {page} / {totalPages}
        </Text>
        <Pressable
          disabled={page >= totalPages}
          onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
          style={[styles.pageButton, page >= totalPages && styles.disabledButton]}>
          <Text style={styles.pageButtonText}>Siguiente</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PaginatedCourseList<T extends CourseSummary>({
  courses,
  renderCourse,
  title,
}: {
  courses: T[];
  renderCourse: (course: T) => ReactNode;
  title: string;
}) {
  const [page, setPage] = useState(1);
  const { rows, totalPages } = paginate(courses, page);

  useEffect(() => {
    setPage(1);
  }, [courses.length]);

  return (
    <View style={styles.paginatedList}>
      <View style={styles.tableHeaderBar}>
        <Text style={styles.tableTitle}>{title}</Text>
        <Text style={styles.tableCounter}>
          {courses.length} curso{courses.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.paginatedRows}>
        {rows.length === 0 ? <EmptyState message="No hay cursos para mostrar." /> : rows.map(renderCourse)}
      </View>

      <View style={styles.pagination}>
        <Pressable
          disabled={page <= 1}
          onPress={() => setPage((current) => Math.max(1, current - 1))}
          style={[styles.pageButton, page <= 1 && styles.disabledButton]}>
          <Text style={styles.pageButtonText}>Anterior</Text>
        </Pressable>
        <Text style={styles.pageText}>
          {page} / {totalPages}
        </Text>
        <Pressable
          disabled={page >= totalPages}
          onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
          style={[styles.pageButton, page >= totalPages && styles.disabledButton]}>
          <Text style={styles.pageButtonText}>Siguiente</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <>
      <View style={styles.metricGrid}>
        <MetricCard label="Estudiantes" tone="success" value={String(data.students.length)} />
        <MetricCard label="Cursos" value={String(data.courses.length)} />
      </View>

      <DashboardSection title="Estudiantes" subtitle="Tabla paginada con informacion academica relevante">
        <StudentTable students={data.students} />
      </DashboardSection>

      <DashboardSection title="Cursos" subtitle="Asignaturas registradas en el sistema">
        <PaginatedCourseList
          courses={data.courses}
          title="Cursos registrados"
          renderCourse={(course) => (
            <View key={course.id} style={styles.courseCard}>
              <CourseHeader course={course} />
              <Text style={styles.itemMeta}>
                {[course.facultyName, course.careerName].filter(Boolean).join(' - ') ||
                  'Contexto academico pendiente'}
              </Text>
            </View>
          )}
        />
      </DashboardSection>
    </>
  );
}

function TeacherDashboard({ data }: { data: TeacherDashboardData }) {
  const totalStudents = data.courses.reduce((total, course) => total + course.students.length, 0);
  const highRisk = data.courses.reduce(
    (total, course) =>
      total +
      course.students.filter((student) => student.riskLevel === 'HIGH' || student.riskLevel === 'CRITICAL')
        .length,
    0,
  );

  return (
    <>
      <View style={styles.metricGrid}>
        <MetricCard label="Cursos" value={String(data.courses.length)} />
        <MetricCard label="Estudiantes" tone="success" value={String(totalStudents)} />
        <MetricCard label="Riesgo alto" tone={highRisk > 0 ? 'danger' : 'success'} value={String(highRisk)} />
      </View>

      <DashboardSection title="Mis cursos" subtitle="Cursos asignados, KPIs y estudiantes por curso">
        <PaginatedCourseList
          courses={data.courses}
          title="Cursos asignados"
          renderCourse={(course) => {
            const teacherCourse = data.courses.find((item) => item.id === course.id)!;
            return (
            <View key={course.id} style={styles.courseCard}>
              <CourseHeader course={course} />

              <View style={styles.compactMetricGrid}>
                {teacherCourse.metrics.map((metric) => (
                  <MetricCard key={metric.id} label={metric.label} value={metric.value} />
                ))}
              </View>

              <StudentTable students={teacherCourse.students} title="Estudiantes matriculados" />
            </View>
            );
          }}
        />
      </DashboardSection>
    </>
  );
}

function StudentDashboard({ data }: { data: StudentDashboardData }) {
  return (
    <>
      <View style={styles.metricGrid}>
        <MetricCard label="Cursos" value={String(data.courses.length)} />
        <MetricCard
          label="Con recomendaciones"
          tone="success"
          value={String(data.courses.filter((course) => course.analytics?.recommendation).length)}
        />
      </View>

      <DashboardSection title="Mis cursos" subtitle="Rendimiento, semaforo de riesgo y recomendaciones por materia">
        <PaginatedCourseList
          courses={data.courses}
          title="Cursos matriculados"
          renderCourse={(course) => {
            const studentCourse = data.courses.find((item) => item.id === course.id)!;
            const riskLevel = course.analytics?.riskLevel ?? course.riskLevel;
            const tone = getRiskTone(riskLevel);

            return (
              <View key={course.id} style={[styles.courseCard, riskCardStyles[tone]]}>
                <CourseHeader course={{ ...course, riskLevel }} />

                <View style={styles.compactMetricGrid}>
                  <MetricCard
                    label="Promedio"
                    tone={tone}
                    value={formatAverage(studentCourse.analytics?.average ?? course.currentAverage)}
                  />
                  <MetricCard
                    label="Historial"
                    value={`${studentCourse.analytics?.progress.length ?? 0} semanas`}
                  />
                </View>

                <View style={[styles.riskExplanation, riskExplanationStyles[tone]]}>
                  <Text style={styles.riskExplanationTitle}>
                    {tone === 'danger'
                      ? 'Atencion prioritaria'
                      : tone === 'warning'
                        ? 'Seguimiento recomendado'
                        : tone === 'success'
                          ? 'Riesgo controlado'
                          : 'Datos pendientes'}
                  </Text>
                  <Text style={styles.riskExplanationText}>
                    {tone === 'danger'
                      ? 'Esta materia requiere refuerzo academico y revision frecuente.'
                      : tone === 'warning'
                        ? 'Conviene revisar tareas, asistencia y comprension semanal.'
                        : tone === 'success'
                          ? 'El rendimiento se mantiene en un rango favorable.'
                          : 'Aun no hay suficientes datos para clasificar el riesgo.'}
                  </Text>
                </View>

                <Text style={styles.subheading}>Recomendacion</Text>
                <Text style={styles.paragraph}>
                  {course.analytics?.recommendation ??
                    'Aun no hay una recomendacion predictiva para esta materia.'}
                </Text>

                {studentCourse.analytics?.alerts.length ? (
                  <>
                    <Text style={styles.subheading}>Alertas</Text>
                    {studentCourse.analytics.alerts.slice(0, 3).map((alert) => (
                      <Text key={alert.id} style={styles.alertText}>
                        {alert.message}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>
            );
          }}
        />
      </DashboardSection>
    </>
  );
}

function NotificationPanel({ notifications }: { notifications: AppNotification[] }) {
  return (
    <DashboardSection title="Notificaciones" subtitle="Alertas academicas y avisos recientes">
      {notifications.length === 0 ? (
        <EmptyState message="No tienes notificaciones por ahora." />
      ) : (
        notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <Text style={styles.itemTitle}>{notification.title}</Text>
              <Text style={styles.notificationStatus}>
                {notification.status === 'UNREAD' ? 'Nueva' : 'Leida'}
              </Text>
            </View>
            <Text style={styles.paragraph}>{notification.message}</Text>
          </View>
        ))
      )}
    </DashboardSection>
  );
}

export function RoleWorkspace({ onLogout, tokens, user }: RoleWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<WorkspacePanel>('dashboard');
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'UNREAD').length,
    [notifications],
  );

  async function loadData(refreshing = false) {
    setError(null);
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [dashboardResult, notificationsResult] = await Promise.allSettled([
        user.role === 'ADMIN'
          ? getAdminDashboard(tokens)
          : user.role === 'TEACHER'
            ? getTeacherDashboard(tokens)
            : getStudentDashboard(tokens),
        getNotifications(tokens),
      ]);

      if (dashboardResult.status === 'rejected') {
        throw dashboardResult.reason;
      }

      if (user.role === 'ADMIN') setAdminData(dashboardResult.value as AdminDashboardData);
      if (user.role === 'TEACHER') setTeacherData(dashboardResult.value as TeacherDashboardData);
      if (user.role === 'STUDENT') setStudentData(dashboardResult.value as StudentDashboardData);

      setNotifications(notificationsResult.status === 'fulfilled' ? notificationsResult.value : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el panel.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.brandBlock}>
          <Image
            accessibilityLabel="Logo de MentoraPredict"
            source={require('../../../../../assets/mentorapredict-banner.jpg')}
            style={styles.logoMark}
          />
          <View>
            <Text style={styles.brand}>MentoraPredict</Text>
            <Text style={styles.roleLabel}>Panel {getRoleLabel(user.role)}</Text>
          </View>
        </View>

        <PanelSwitcher
          activePanel={activePanel}
          onChange={setActivePanel}
          unreadCount={unreadCount}
          user={user}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} />}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.itemSubtitle}>Cargando datos del rol...</Text>
          </View>
        ) : error ? (
          <View style={styles.courseCard}>
            <Text style={styles.itemTitle}>No se pudo cargar el panel</Text>
            <Text style={styles.paragraph}>{error}</Text>
            <AppButton onPress={() => loadData()}>Reintentar</AppButton>
          </View>
        ) : activePanel === 'profile' ? (
          <SessionSummary onLogout={onLogout} user={user} />
        ) : activePanel === 'notifications' ? (
          <NotificationPanel notifications={notifications} />
        ) : user.role === 'ADMIN' && adminData ? (
          <AdminDashboard data={adminData} />
        ) : user.role === 'TEACHER' && teacherData ? (
          <TeacherDashboard data={teacherData} />
        ) : user.role === 'STUDENT' && studentData ? (
          <StudentDashboard data={studentData} />
        ) : (
          <EmptyState message="No hay informacion disponible para este rol." />
        )}
      </ScrollView>
    </View>
  );
}

const riskCardStyles = StyleSheet.create({
  default: {
    borderLeftWidth: 5,
    borderLeftColor: '#94A3B8',
  },
  success: {
    borderLeftWidth: 5,
    borderLeftColor: '#16A34A',
  },
  warning: {
    borderLeftWidth: 5,
    borderLeftColor: '#D97706',
  },
  danger: {
    borderLeftWidth: 5,
    borderLeftColor: '#DC2626',
  },
});

const riskExplanationStyles = StyleSheet.create({
  default: {
    backgroundColor: '#F1F5F9',
  },
  success: {
    backgroundColor: '#DCFCE7',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
});

const riskPillStyles = StyleSheet.create({
  default: {
    backgroundColor: '#E2E8F0',
  },
  success: {
    backgroundColor: '#DCFCE7',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoMark: {
    width: 42,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  brand: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  roleLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelButton: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelButtonText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '900',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeProfileButton: {
    backgroundColor: '#2563EB',
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  profileInitials: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '900',
  },
  activeIconButton: {
    backgroundColor: '#2563EB',
  },
  iconText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '900',
  },
  activeIconText: {
    color: '#FFFFFF',
  },
  bellIcon: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '900',
  },
  bellCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontSize: 10,
    fontWeight: '900',
  },
  content: {
    padding: 18,
    gap: 18,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compactMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  courseCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleGroup: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 12,
  },
  itemTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  itemSubtitle: {
    color: '#475569',
    fontSize: 12,
  },
  itemMeta: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
  subheading: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  paragraph: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  riskExplanation: {
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  riskExplanationTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  riskExplanationText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 17,
  },
  alertText: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  notificationCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  notificationStatus: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '900',
  },
  paginatedList: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  paginatedRows: {
    padding: 12,
    gap: 12,
  },
  tableCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeaderBar: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  tableTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
  },
  tableCounter: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  tableHeaderText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  tableNameColumn: {
    flex: 1.45,
  },
  tableRoleColumn: {
    flex: 0.58,
  },
  tableRiskColumn: {
    flex: 0.72,
  },
  tableMetaColumn: {
    flex: 1,
  },
  tablePrimary: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  tableSecondary: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  tableCell: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
  },
  riskPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskPillText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pageButton: {
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '900',
  },
  pageText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  loadingBox: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
});
