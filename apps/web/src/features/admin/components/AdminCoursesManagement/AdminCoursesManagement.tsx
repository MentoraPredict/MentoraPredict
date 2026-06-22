import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";

import type { Course } from "@/types/course";

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Estadística avanzada",
    teacherName: "Dr. Alberto Rodriguez",
    semester: "2024-II",
    description:
      "Fundamentos de estadística avanzada aplicada a la toma de decisiones empresariales y minería de datos.",
    riskLevel: "HIGH",
  },
  {
    id: "2",
    name: "Programación concurrente",
    teacherName: "Ing. Marta Sánchez",
    semester: "2024-II",
    description:
      "Introducción a la programación concurrente y algoritmos distribuidos para arquitecturas modernas.",
    riskLevel: "LOW",
  },
  {
    id: "3",
    name: "Psicología cognitiva",
    teacherName: "Dra. Claudia Pérez",
    semester: "2024-II",
    description:
      "Psicología cognitiva y procesos de aprendizaje en entornos virtuales y educación híbrida.",
    riskLevel: "MEDIUM",
  },
];

export default function AdminCoursesManagement() {
  return (
    <section className="py-8">
      <Container>
        <div className="mb-6">
          <Heading as="h3" className="text-gray-900">
            Cursos
          </Heading>

          <Text variant="small" className="mt-2 max-w-2xl">
            Visualiza los cursos creados por los docentes dentro de
            MentoraPredict.
          </Text>
        </div>

        <CourseGrid courses={mockCourses} />
      </Container>
    </section>
  );
}
