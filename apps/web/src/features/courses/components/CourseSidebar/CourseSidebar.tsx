import {
  FiBookOpen,
  FiGrid,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import Text from "@/components/atoms/Text";
import LogoLink from "@/components/molecules/LogoLink";
import CourseSidebarNavItem from "@/features/courses/components/CourseSidebarNavItem";

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

  return (
    <aside
      className="
                sticky
                top-0
                hidden
                h-screen
                w-64
                shrink-0
                overflow-y-auto
                bg-blue-950
                px-5
                py-6
                text-white
                md:block
            "
    >
      <div className="mb-10">
        <LogoLink variant="light" />

        <Text
          variant="caption"
          className="
                        mt-1
                        uppercase
                        tracking-[0.2em]
                        text-white
                    "
        >
          Academic Strategy
        </Text>
      </div>

      <nav className="space-y-2">
        <CourseSidebarNavItem
          to={`${basePath}/courses`}
          icon={<FiGrid size={18} />}
          label={isTeacher ? "Panel docente" : "Panel academico"}
        />
      </nav>

      <div className="mt-10">
        <Text
          variant="caption"
          className="
                        mb-3
                        uppercase
                        tracking-[0.18em]
                        text-white
                    "
        >
          {isTeacher ? "Mis cursos" : "Mis materias"}
        </Text>

        <div className="space-y-2">
          {courses.map((course) => (
            <NavLink
              key={course.id}
              to={`${basePath}/courses/${course.id}/performance`}
              className={({ isActive }) =>
                `
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    px-4
                                    py-2
                                    transition
                                    ${
                                      isActive
                                        ? "bg-blue-700 text-white"
                                        : "text-white hover:bg-blue-800"
                                    }
                                `
              }
            >
              <FiBookOpen size={14} />

              <Text variant="caption" className="font-medium !text-white">
                {course.name}
              </Text>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
