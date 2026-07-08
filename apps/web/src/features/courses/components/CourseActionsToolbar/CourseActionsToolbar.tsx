import { ReactNode } from "react";
import { FiBarChart2, FiEdit3, FiUploadCloud, FiUsers } from "react-icons/fi";
import { NavLink } from "react-router-dom";

import {
  getStudentCoursePerformancePath,
  getStudentCourseUploadDataPath,
  getTeacherCourseEditPath,
  getTeacherCoursePerformancePath,
  getTeacherCourseStudentsPath,
  getTeacherCourseUploadDataPath,
} from "@/routes/paths";

type CourseActionsToolbarMode = "teacher" | "student";

interface CourseActionsToolbarProps {
  mode: CourseActionsToolbarMode;
  courseId: string;
}

interface ToolbarAction {
  to: string;
  label: string;
  icon: ReactNode;
}

function getTeacherActions(courseId: string): ToolbarAction[] {
  return [
    {
      to: getTeacherCoursePerformancePath(courseId),
      label: "Rendimiento",
      icon: <FiBarChart2 size={16} />,
    },
    {
      to: getTeacherCourseUploadDataPath(courseId),
      label: "Subir datos",
      icon: <FiUploadCloud size={16} />,
    },
    {
      to: getTeacherCourseStudentsPath(courseId),
      label: "Estudiantes",
      icon: <FiUsers size={16} />,
    },
    {
      to: getTeacherCourseEditPath(courseId),
      label: "Editar curso",
      icon: <FiEdit3 size={16} />,
    },
  ];
}

function getStudentActions(courseId: string): ToolbarAction[] {
  return [
    {
      to: getStudentCoursePerformancePath(courseId),
      label: "Rendimiento",
      icon: <FiBarChart2 size={16} />,
    },
    {
      to: getStudentCourseUploadDataPath(courseId),
      label: "Subir datos",
      icon: <FiUploadCloud size={16} />,
    },
  ];
}

export default function CourseActionsToolbar({
  mode,
  courseId,
}: CourseActionsToolbarProps) {
  const actions =
    mode === "teacher" ? getTeacherActions(courseId) : getStudentActions(courseId);

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-max gap-2">
        {actions.map((action) => (
          <NavLink
            key={action.to}
            to={action.to}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")
            }
          >
            {action.icon}
            {action.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
