import { FiBookOpen, FiClipboard, FiGrid, FiLogOut, FiTrendingUp } from "react-icons/fi";

import DashboardSidebar, {
  type DashboardSidebarSection,
} from "@/components/organisms/DashboardSidebar";
import useLogout from "@/hooks/useLogout";
import { APP_PATHS } from "@/routes/paths";
import type { Course } from "@/types/course";

interface StudentMainSidebarProps {
  courses: Course[];
}

/**
 * Sidebar completo del estudiante: Inicio, Encuestas y Mis materias
 * (colapsable, listando los cursos matriculados). Evaluaciones y Charlas
 * con IA se retiraron de aquí — ahora viven como botones en la barra
 * horizontal de cada materia (CourseActionsToolbar), junto con Rendimiento,
 * Encuesta del sílabo y Actividades. Calendario, Tareas, Materiales y
 * Notificaciones se retiraron del sidebar hasta que tengan funcionalidad
 * real; Perfil ya es accesible desde el dropdown de la barra superior.
 */
export default function StudentMainSidebar({
  courses,
}: StudentMainSidebarProps) {
  const { isLoggingOut, handleLogout } = useLogout();

  const sections: DashboardSidebarSection[] = [
    {
      items: [
        {
          to: APP_PATHS.student.dashboard,
          icon: <FiGrid size={18} />,
          label: "Inicio",
        },
        {
          to: APP_PATHS.student.progress,
          icon: <FiTrendingUp size={18} />,
          label: "Mis calificaciones",
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
                })),
              },
            ]
          : []),
      ],
    },
  ];

  return <DashboardSidebar title="Academic Strategy" sections={sections} />;
}
