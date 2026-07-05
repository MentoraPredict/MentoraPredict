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
      ],
    },
    {
      label: isTeacher ? "Mis cursos" : "Mis materias",
      items: courses.map((course) => ({
        to: `${basePath}/courses/${course.id}/performance`,
        icon: <FiBookOpen size={14} />,
        label: course.name,
      })),
    },
  ];

  return <DashboardSidebar title="Academic Strategy" sections={sections} />;
}
