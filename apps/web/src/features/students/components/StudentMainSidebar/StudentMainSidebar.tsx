import { FiBell, FiBookOpen, FiClipboard, FiGrid } from "react-icons/fi";

import DashboardSidebar, {
  type DashboardSidebarSection,
} from "@/components/organisms/DashboardSidebar";
import { APP_PATHS } from "@/routes/paths";
import type { Course } from "@/types/course";

interface StudentMainSidebarProps {
  courses: Course[];
}

/**
 * Barra lateral del estudiante: Inicio (con las pestañas Materias, Mis
 * calificaciones y Mi asistencia), Notificaciones, Encuestas y Mis materias (colapsable, con los cursos matriculados).
 */
export default function StudentMainSidebar({
  courses,
}: StudentMainSidebarProps) {
  const sections: DashboardSidebarSection[] = [
    {
      items: [
        {
          to: APP_PATHS.student.dashboard,
          icon: <FiGrid size={18} />,
          label: "Inicio",
          end: true,
        },
        {
          to: APP_PATHS.student.notifications,
          icon: <FiBell size={18} />,
          label: "Notificaciones",
        },
        {
          to: APP_PATHS.student.survey,
          icon: <FiClipboard size={18} />,
          label: "Encuestas",
        },
        ...(courses.length > 0
          ? [
              {
                label: "Mis materias",
                icon: <FiBookOpen size={18} />,
                children: courses.map((course) => ({
                  to: `/student/courses/${course.id}/performance`,
                  icon: <FiBookOpen size={14} />,
                  label: course.name,
                  matchPrefix: `/student/courses/${course.id}`,
                })),
              },
            ]
          : []),
      ],
    },
  ];

  return <DashboardSidebar title="Panel del estudiante" sections={sections} />;
}
