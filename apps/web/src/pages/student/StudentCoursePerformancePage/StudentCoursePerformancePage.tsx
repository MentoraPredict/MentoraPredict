import { useParams } from "react-router-dom";

import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import StudentCoursePerformance from "@/features/students/components/StudentCoursePerformance";

import type { Course } from "@/types/course";

const mockStudentCourses: Course[] = [
  {
    id: "1",
    name: "Álgebra Lineal",
    teacherName: "Dr. Roberto Sánchez",
    semester: "2024-I",
    description:
      "Fundamentos de espacios vectoriales, matrices y transformaciones lineales.",
    riskLevel: "HIGH",
    riskLabel: "Estudiante en riesgo",
  },
  {
    id: "2",
    name: "Programación II",
    teacherName: "Ing. Martha Luz Pardo",
    semester: "2024-I",
    description:
      "Desarrollo avanzado bajo el paradigma de programación orientada a objetos.",
    riskLevel: "LOW",
    riskLabel: "Estudiante en óptimas condiciones",
  },
  {
    id: "3",
    name: "Matemáticas Discretas",
    teacherName: "Lic. Jorge Eliécer",
    semester: "2024-I",
    description:
      "Teoría de grafos, conjuntos y lógica proposicional aplicada a la computación.",
    riskLevel: "MEDIUM",
    riskLabel: "Estudiante medianamente en riesgo",
  },
];

export default function StudentCoursePerformancePage() {
  const { courseId } = useParams();

  const activeCourse =
    mockStudentCourses.find((course) => course.id === courseId) ??
    mockStudentCourses[0];

  return (
    <CourseAnalyticsLayout
      title={`${activeCourse.name} - Estudiante`}
      sidebar={
        <CourseSidebar
          mode="student"
          courses={mockStudentCourses}
          activeCourseId={activeCourse.id}
        />
      }
    >
      <StudentCoursePerformance courseId={activeCourse.id} />
    </CourseAnalyticsLayout>
  );
}
