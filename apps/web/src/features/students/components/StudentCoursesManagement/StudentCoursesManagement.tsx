import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";

import type { Course } from "@/types/course";

import { useNavigate } from "react-router-dom";
import { getStudentCoursePerformancePath } from "@/routes/paths";

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

export default function StudentCoursesManagement() {
  const navigate = useNavigate();
  const courses = mockStudentCourses;

  return (
    <section className="py-8">
      <Container>
        <div
          className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-6
                    "
        >
          <div className="mb-8">
            <Heading as="h3" className="text-gray-900">
              Mis Cursos
            </Heading>

            <Text variant="small" className="mt-2">
              Revisa tu progreso académico y análisis de riesgo en tiempo real.
            </Text>
          </div>

          {courses.length > 0 ? (
            <CourseGrid
              courses={courses}
              onCourseClick={(courseId) => {
                navigate(getStudentCoursePerformancePath(courseId));
              }}
            />
          ) : (
            <StudentCoursesEmptyState />
          )}
        </div>
      </Container>
    </section>
  );
}
