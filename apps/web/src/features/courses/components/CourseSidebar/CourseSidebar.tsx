import { FiBookOpen, FiGrid } from "react-icons/fi";
import DashboardSidebar, {
  type DashboardSidebarSection,
} from "@/components/organisms/DashboardSidebar";

import type { Course } from "@/types/course";

type CourseSidebarMode = "teacher" | "student";

interface CourseSidebarProps {
  mode: CourseSidebarMode;
  courses: Course[];
  activeCourseId?: string;
}

function getBasePath(mode: CourseSidebarMode) {
  return mode === "teacher" ? "/teacher" : "/student";
}

/**
 * "Mis materias" es un grupo colapsable (igual que en StudentMainSidebar):
 * se despliega solo cuando la ruta actual es una de sus materias, así el
 * panel no se llena de enlaces cuando el docente tiene muchas asignadas.
 */
export default function CourseSidebar({
  mode,
  courses,
}: CourseSidebarProps) {
  const basePath = getBasePath(mode);
  const isTeacher = mode === "teacher";

  const sections: DashboardSidebarSection[] = [
    {
      items: [
        {
          to: `${basePath}/courses`,
          icon: <FiGrid size={18} />,
          label: isTeacher ? "Panel docente" : "Panel academico",
        },
        ...(courses.length > 0
          ? [
              {
                label: "Mis materias",
                icon: <FiBookOpen size={18} />,
                children: courses.map((course) => ({
                  to: `${basePath}/courses/${course.id}/performance`,
                  icon: <FiBookOpen size={14} />,
                  label: course.name,
                })),
              },
            ]
          : []),
      ],
    },
  ];

  return <DashboardSidebar title={isTeacher ? "Panel docente" : "Panel del estudiante"} sections={sections} />;
}
