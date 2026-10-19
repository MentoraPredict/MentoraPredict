import { useCallback, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import StudentCheckInHistory from "@/features/students/components/StudentCheckInHistory";
import StudentCheckInWizard from "@/features/students/components/StudentCheckInWizard";
import {
  listStudentCheckIns,
  type StudentCheckInResponse,
} from "@/services/academic.service";

import type { Course } from "@/types/course";

interface StudentCourseUploadDataProps {
  course?: Course | null;
}

/**
 * Registrar avance: muestra los avances ya registrados (con su fecha) y un
 * botón para registrar uno nuevo, que abre el asistente por pasos.
 */
export default function StudentCourseUploadData({
  course,
}: StudentCourseUploadDataProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [checkIns, setCheckIns] = useState<StudentCheckInResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const courseId = course?.id;

  const loadCheckIns = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);

    try {
      setCheckIns(await listStudentCheckIns(courseId));
    } catch {
      setError("No se pudieron cargar tus avances registrados.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCheckIns();
  }, [loadCheckIns]);

  if (!course) {
    return null;
  }

  if (isRegistering) {
    return (
      <StudentCheckInWizard
        course={course}
        onCancel={() => setIsRegistering(false)}
        onSaved={() => {
          setIsRegistering(false);
          setSavedMessage(
            "Avance guardado. La analítica de la materia se recalculará automáticamente."
          );
          void loadCheckIns();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <Heading as="h4" className="text-gray-900">
            {course.name}
          </Heading>
          <Text variant="small" className="mt-1 text-gray-600">
            {checkIns.length > 0
              ? `${checkIns.length} ${checkIns.length === 1 ? "avance registrado" : "avances registrados"}`
              : "Aún no has registrado avances en esta materia."}
          </Text>
        </div>

        <Button
          type="button"
          onClick={() => {
            setSavedMessage(null);
            setIsRegistering(true);
          }}
          className="gap-2"
        >
          <FiPlus size={16} />
          Registrar nuevo avance
        </Button>
      </div>

      {savedMessage ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <FeedbackMessage message={savedMessage} tone="success" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <FeedbackMessage message={error} tone="error" />
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando avances...</Text>
        </div>
      ) : checkIns.length > 0 ? (
        <StudentCheckInHistory checkIns={checkIns} />
      ) : null}
    </div>
  );
}
