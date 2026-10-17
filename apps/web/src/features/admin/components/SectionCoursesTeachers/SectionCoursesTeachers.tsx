import { useCallback, useEffect, useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import {
  assignCourseTeacher,
  getSectionCourses,
  type SectionCourse,
} from "@/services/academic-structure.service";
import type { AppUser } from "@/types/user/user.types";
import { getApiErrorMessage } from "@/utils/apiError";

interface SectionCoursesTeachersProps {
  sectionId: string;
  sectionLabel: string;
  teachers: AppUser[];
  onClose: () => void;
}

const teacherLabel = (teacher: AppUser) =>
  [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() || teacher.email;

export default function SectionCoursesTeachers({
  sectionId,
  sectionLabel,
  teachers,
  onClose,
}: SectionCoursesTeachersProps) {
  const [courses, setCourses] = useState<SectionCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCourses(await getSectionCourses(sectionId));
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar los cursos del paralelo."));
    } finally {
      setIsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const assign = async (courseId: string, teacherId: string) => {
    setSavingId(courseId);
    setError(null);

    try {
      await assignCourseTeacher(courseId, teacherId || null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo asignar al docente."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-h-[85vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div>
        <Heading as="h4" className="text-gray-900">
          Docentes de {sectionLabel}
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          El docente asignado ve el curso en su panel y registra las notas desde el
          libro de calificaciones.
        </Text>
      </div>

      {error ? (
        <Text variant="small" className="font-medium text-red-700">
          {error}
        </Text>
      ) : null}

      {isLoading ? <Text variant="small">Cargando...</Text> : null}

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {courses.map((course) => (
          <div key={course.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Text variant="small" className="min-w-[10rem] flex-1 font-medium text-gray-900">
              {course.name}
            </Text>
            <Select
              aria-label={`Docente de ${course.name}`}
              className="w-60 py-2"
              disabled={savingId === course.id}
              value={course.teacherId ?? ""}
              onChange={(e) => void assign(course.id, e.target.value)}
            >
              <option value="">Sin docente</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacherLabel(teacher)}
                </option>
              ))}
            </Select>
          </div>
        ))}

        {!isLoading && courses.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Text variant="small" className="text-gray-600">
              Este paralelo aún no tiene cursos. Usa «Generar cursos».
            </Text>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
