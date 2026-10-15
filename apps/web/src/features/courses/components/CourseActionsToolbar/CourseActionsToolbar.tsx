import { ReactNode } from "react";
import {
  FiBarChart2,
  FiCheckSquare,
  FiClipboard,
  FiEdit3,
  FiMessageCircle,
  FiSmile,
  FiTrendingDown,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import {
  getStudentCourseActivitiesPath,
  getStudentCourseAiChatPath,
  getStudentCourseEvaluationsPath,
  getStudentCoursePerformancePath,
  getStudentCourseSurveyPath,
  getTeacherCourseDropoutRiskPath,
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
      to: getTeacherCourseDropoutRiskPath(courseId),
      label: "Riesgo de deserción",
      icon: <FiTrendingDown size={16} />,
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
      to: getStudentCourseSurveyPath(courseId, "syllabus-comprehension"),
      label: "Encuesta del sílabo",
      icon: <FiSmile size={16} />,
    },
    {
      to: getStudentCourseActivitiesPath(courseId),
      label: "Actividades",
      icon: <FiCheckSquare size={16} />,
    },
    {
      to: getStudentCourseEvaluationsPath(courseId),
      label: "Evaluaciones",
      icon: <FiClipboard size={16} />,
    },
    {
      to: getStudentCourseAiChatPath(courseId),
      label: "Charlar con IA",
      icon: <FiMessageCircle size={16} />,
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
    <div className="mb-6 overflow-x-auto border-b border-gray-200">
      <div className="flex min-w-max gap-2">
        {actions.map((action) => (
          <NavLink
            key={action.to}
            to={action.to}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700",
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
