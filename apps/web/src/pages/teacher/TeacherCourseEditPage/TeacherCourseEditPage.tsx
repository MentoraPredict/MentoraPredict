import { useParams } from "react-router-dom";

import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import TeacherCourseEdit from "@/features/teachers/components/TeacherCourseEdit";

import type { Course } from "@/types/course";

const mockTeacherCourses: Course[] = [
  {
    id: "1",
    name: "Álgebra Lineal",
    teacherName: "Dr. Roberto Sánchez",
    semester: "2024-I",
    description:
      "Fundamentos de espacios vectoriales, matrices y transformaciones lineales.",
    riskLevel: "HIGH",
  },
  {
    id: "2",
    name: "Programación II",
    teacherName: "Ing. Martha Luz Pardo",
    semester: "2024-I",
    description:
      "Desarrollo avanzado bajo el paradigma de programación orientada a objetos.",
    riskLevel: "LOW",
  },
  {
    id: "3",
    name: "Matemáticas Discretas",
    teacherName: "Lic. Jorge Eliécer",
    semester: "2024-I",
    description:
      "Teoría de grafos, conjuntos y lógica proposicional aplicada a la computación.",
    riskLevel: "MEDIUM",
  },
];

export default function TeacherCourseEditPage() {
  const { courseId } = useParams();

  const activeCourse =
    mockTeacherCourses.find((course) => course.id === courseId) ??
    mockTeacherCourses[0];

  return (
    <CourseAnalyticsLayout
      title={`${activeCourse.name} - Docente`}
      sidebar={
        <CourseSidebar
          mode="teacher"
          courses={mockTeacherCourses}
          activeCourseId={activeCourse.id}
        />
      }
    >
      <TeacherCourseEdit course={activeCourse} />
    </CourseAnalyticsLayout>
  );
}
