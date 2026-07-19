import {
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMessageCircle,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import DashboardSidebar, {
  type DashboardSidebarSection,
} from "@/components/organisms/DashboardSidebar";
import UserAvatar from "@/components/atoms/UserAvatar";
import Text from "@/components/atoms/Text";
import useLogout from "@/hooks/useLogout";
import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";
import type { Course } from "@/types/course";

interface StudentMainSidebarProps {
  courses: Course[];
}

/**
 * Sidebar completo del estudiante, rediseñado a pedido del usuario para
 * imitar la estructura del mockup compartido (Inicio, Calendario, Tareas,
 * Materiales, Evaluaciones, Encuestas y Charlas, Mi Progreso,
 * Notificaciones, Perfil, Cerrar sesión). Las secciones sin funcionalidad
 * real todavía (Calendario/Tareas/Materiales/Evaluaciones/Mi Progreso/
 * Notificaciones) navegan a una página real con un estado "Próximamente"
 * (ComingSoonSection) — nunca a un enlace roto. "Mis materias" se conserva
 * como sección propia porque es navegación real que ya existía.
 */
export default function StudentMainSidebar({
  courses,
}: StudentMainSidebarProps) {
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, handleLogout } = useLogout();

  const studentName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Estudiante";

  const sections: DashboardSidebarSection[] = [
    {
      items: [
        { to: APP_PATHS.student.dashboard, icon: <FiGrid size={18} />, label: "Inicio" },
        { to: APP_PATHS.student.calendar, icon: <FiCalendar size={18} />, label: "Calendario" },
        { to: APP_PATHS.student.tasks, icon: <FiCheckSquare size={18} />, label: "Tareas" },
        { to: APP_PATHS.student.materials, icon: <FiFolder size={18} />, label: "Materiales" },
        {
          to: APP_PATHS.student.evaluations,
          icon: <FiClipboard size={18} />,
          label: "Evaluaciones",
        },
        {
          label: "Encuestas y Charlas",
          icon: <FiMessageCircle size={18} />,
          children: [
            { to: APP_PATHS.student.survey, icon: <FiClipboard size={14} />, label: "Encuestas" },
            {
              to: APP_PATHS.student.aiChat,
              icon: <FiMessageCircle size={14} />,
              label: "Charlas con IA",
            },
          ],
        },
        {
          to: APP_PATHS.student.progress,
          icon: <FiTrendingUp size={18} />,
          label: "Mi Progreso",
        },
        {
          to: APP_PATHS.student.notifications,
          icon: <FiBell size={18} />,
          label: "Notificaciones",
        },
      ],
    },
    {
      label: "Mis materias",
      items: courses.map((course) => ({
        to: `/student/courses/${course.id}/performance`,
        icon: <FiBookOpen size={14} />,
        label: course.name,
      })),
    },
    {
      items: [
        { to: APP_PATHS.student.profile, icon: <FiUser size={18} />, label: "Perfil" },
        {
          icon: <FiLogOut size={18} />,
          label: isLoggingOut ? "Saliendo..." : "Cerrar sesión",
          onClick: () => {
            void handleLogout();
          },
        },
      ],
    },
  ];

  return (
    <DashboardSidebar
      title="Academic Strategy"
      sections={sections}
      footer={
        <div className="flex items-center gap-3">
          <UserAvatar
            imageUrl={user?.avatarUrl ?? undefined}
            firstName={user?.firstName}
            lastName={user?.lastName}
            className="border-white/20 bg-blue-900"
          />
          <div className="min-w-0">
            <Text variant="small" className="truncate font-semibold !text-white">
              {studentName}
            </Text>
            <Text variant="caption" className="!text-blue-200">
              Estudiante
            </Text>
          </div>
        </div>
      }
    />
  );
}
