import { useEffect, useMemo, useState } from "react";

import Text from "@/components/atoms/Text";
import CollapsibleGroup from "@/components/molecules/CollapsibleGroup";
import ListToolbar from "@/components/molecules/ListToolbar";
import TeacherCourseStudentsTable from "@/features/teachers/components/TeacherCourseStudentsTable";
import { getCourseEnrolledStudents } from "@/services/academic.service";
import {
  getTeacherStudentSubjectPrediction,
  getTeacherSubjectAnalytics,
  type TeacherStudentPrediction,
} from "@/services/course-analytics.service";

import type { CourseEnrolledStudent } from "@/types/course";

interface TeacherCourseStudentsProps {
  courseId: string;
}

const RISK_LABELS: Record<string, string> = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
  NONE: "Sin predicción",
};

const RISK_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Lista del curso en solo lectura. La matrícula la gestiona secretaría; aquí
 * el docente consulta a sus estudiantes y la recomendación de cada uno.
 */
export default function TeacherCourseStudents({
  courseId,
}: TeacherCourseStudentsProps) {
  const [enrolledStudents, setEnrolledStudents] = useState<
    CourseEnrolledStudent[]
  >([]);
  const [studentPredictions, setStudentPredictions] = useState<
    TeacherStudentPrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingPredictionStudentId, setRegeneratingPredictionStudentId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [groupBy, setGroupBy] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const courseStudents = await getCourseEnrolledStudents(courseId);
        const analytics = await getTeacherSubjectAnalytics(courseId).catch(
          () => null,
        );

        if (isMounted) {
          setEnrolledStudents(courseStudents.filter((item) => item.isEnrolled));
          setStudentPredictions(analytics?.predictions ?? []);
        }
      } catch {
        if (isMounted) {
          setError("No se pudieron cargar los estudiantes del curso.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const studentPredictionsById = useMemo(
    () =>
      new Map(
        studentPredictions.map((prediction) => [
          prediction.studentId,
          prediction,
        ]),
      ),
    [studentPredictions],
  );

  const riskOf = (student: CourseEnrolledStudent) =>
    studentPredictionsById.get(student.user.id)?.predictedRiskLevel ?? "NONE";

  const visibleStudents = useMemo(() => {
    const terms = normalize(search).split(/\s+/).filter(Boolean);

    return enrolledStudents.filter((student) => {
      if (riskFilter && riskOf(student) !== riskFilter) return false;

      const haystack = normalize(
        [student.user.firstName, student.user.lastName, student.user.email]
          .filter(Boolean)
          .join(" "),
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [enrolledStudents, search, riskFilter, studentPredictionsById]);

  const groupedStudents = useMemo(() => {
    if (!groupBy) return [];
    const groups = new Map<string, CourseEnrolledStudent[]>();
    for (const student of visibleStudents) {
      const key = riskOf(student);
      groups.set(key, [...(groups.get(key) ?? []), student]);
    }
    return RISK_ORDER.filter((key) => groups.has(key)).map(
      (key) => [key, groups.get(key) ?? []] as const,
    );
  }, [visibleStudents, groupBy, studentPredictionsById]);

  const clearAll = () => {
    setSearch("");
    setRiskFilter("");
    setGroupBy("");
  };

  const handleRegeneratePrediction = async (studentId: string) => {
    setRegeneratingPredictionStudentId(studentId);
    setError(null);
    setSuccessMessage(null);

    try {
      const prediction = await getTeacherStudentSubjectPrediction(
        courseId,
        studentId,
      );

      if (!prediction) {
        setError("No se obtuvo una recomendación para este estudiante.");
        return;
      }

      setStudentPredictions((currentPredictions) => [
        prediction,
        ...currentPredictions.filter(
          (currentPrediction) => currentPrediction.studentId !== studentId,
        ),
      ]);
      setSuccessMessage("Recomendación actualizada.");
    } catch {
      setError("No se pudo actualizar la recomendación.");
    } finally {
      setRegeneratingPredictionStudentId(null);
    }
  };

  const renderTable = (students: CourseEnrolledStudent[], bare = false) => (
    <TeacherCourseStudentsTable
      students={students}
      bare={bare}
      studentPredictionsById={studentPredictionsById}
      regeneratingPredictionStudentId={regeneratingPredictionStudentId}
      onRegeneratePrediction={handleRegeneratePrediction}
    />
  );

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <ListToolbar
          search={search}
          searchPlaceholder="Buscar estudiantes por nombre, apellido o correo"
          searchLabel="Buscar estudiantes"
          onSearchChange={setSearch}
          onClear={clearAll}
          filters={[
            {
              id: "risk",
              label: "Riesgo esperado",
              value: riskFilter,
              allLabel: "Todos los niveles",
              options: RISK_ORDER.map((value) => ({
                value,
                label: RISK_LABELS[value],
              })),
              onChange: setRiskFilter,
            },
          ]}
          group={{
            value: groupBy,
            options: [{ value: "risk", label: "Riesgo esperado" }],
            onChange: setGroupBy,
          }}
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <Text variant="small" className="font-medium text-emerald-700">
            {successMessage}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando estudiantes...</Text>
        </div>
      ) : groupBy ? (
        groupedStudents.map(([key, students]) => (
          <CollapsibleGroup
            key={key}
            label={RISK_LABELS[key]}
            count={students.length}
          >
            {renderTable(students, true)}
          </CollapsibleGroup>
        ))
      ) : (
        renderTable(visibleStudents)
      )}
    </div>
  );
}