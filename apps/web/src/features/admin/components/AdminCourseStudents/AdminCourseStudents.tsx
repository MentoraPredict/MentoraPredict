import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import AdminSyllabusPanel from "@/features/admin/components/AdminSyllabusPanel";
import TeacherCourseStudents from "@/features/teachers/components/TeacherCourseStudents";
import { APP_PATHS } from "@/routes/paths";
import type { Course } from "@/types/course";

interface AdminCourseStudentsProps {
  course: Course;
}

export default function AdminCourseStudents({ course }: AdminCourseStudentsProps) {
  const navigate = useNavigate();
  const averageLabel =
    typeof course.currentAverage === "number"
      ? `${course.currentAverage.toFixed(2)} / 20`
      : "Sin promedio";

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-blue-100 text-blue-700">Administración</Badge>
            <Heading as="h3" className="mt-3 text-gray-900">
              {course.name}
            </Heading>
            <Text variant="small" className="mt-2 max-w-2xl">
              Información del curso, del docente asignado y sus estudiantes
              matriculados.
            </Text>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-fit gap-2 px-4 py-2 text-sm"
            onClick={() => navigate(APP_PATHS.admin.courses)}
          >
            <FiArrowLeft size={16} />
            Regresar a cursos
          </Button>
        </div>

        <MotionCard
          as="section"
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Docente
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {course.teacherName}
              </Text>
            </div>

            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Semestre
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {course.semester}
              </Text>
            </div>

            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Estado
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {(course.isActive ?? true) ? "Curso activo" : "Curso inactivo"}
              </Text>
            </div>

            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Promedio del curso
              </Text>
              <Text variant="small" className="mt-1 font-semibold text-gray-900">
                {averageLabel}
              </Text>
            </div>
          </div>

          {course.description ? (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Descripción
              </Text>
              <Text variant="small" className="mt-1 text-gray-700">
                {course.description}
              </Text>
            </div>
          ) : null}
        </MotionCard>

        <MotionCard
          as="section"
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <AdminSyllabusPanel subjectId={course.id} />
        </MotionCard>

        <MotionCard
          as="section"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <Heading as="h5" className="mb-5 text-gray-900">
            Estudiantes matriculados
          </Heading>

          <TeacherCourseStudents courseId={course.id} />
        </MotionCard>
      </Container>
    </section>
  );
}
