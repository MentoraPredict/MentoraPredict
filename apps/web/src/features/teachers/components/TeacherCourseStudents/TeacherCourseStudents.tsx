import { useEffect, useMemo, useState } from "react";

import Text from "@/components/atoms/Text";
import TeacherCourseStudentsTable from "@/features/teachers/components/TeacherCourseStudentsTable";
import TeacherCourseStudentsToolbar from "@/features/teachers/components/TeacherCourseStudentsToolbar";
import {
  enrollStudentsInCourse,
  getCourseEnrolledStudents,
  updateCourseEnrollmentStatus,
} from "@/services/academic.service";
import {
  getTeacherStudentSubjectPrediction,
  getTeacherSubjectAnalytics,
  type TeacherStudentPrediction,
} from "@/services/course-analytics.service";
import { getStudents } from "@/services/users/users.service";

import type { CourseEnrolledStudent } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

interface TeacherCourseStudentsProps {
  courseId: string;
}

export default function TeacherCourseStudents({
  courseId,
}: TeacherCourseStudentsProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<AppUser[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<AppUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<
    CourseEnrolledStudent[]
  >([]);
  const [studentPredictions, setStudentPredictions] = useState<
    TeacherStudentPrediction[]
  >([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<
    string | null
  >(null);
  const [regeneratingPredictionStudentId, setRegeneratingPredictionStudentId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      setIsLoadingStudents(true);
      setError(null);

      try {
        const students = await getStudents();
        const courseStudents = await getCourseEnrolledStudents(courseId);
        const analytics = await getTeacherSubjectAnalytics(courseId).catch(
          () => null,
        );

        if (isMounted) {
          setAvailableStudents(students);
          setEnrolledStudents(courseStudents);
          setStudentPredictions(analytics?.predictions ?? []);
        }
      } catch {
        if (isMounted) {
          setError("No se pudieron cargar los estudiantes del curso.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingStudents(false);
        }
      }
    };

    void loadStudents();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const enrolledUserIds = useMemo(
    () =>
      enrolledStudents
        .filter((student) => student.isEnrolled)
        .map((student) => student.user.id),
    [enrolledStudents],
  );

  const selectedUserIds = useMemo(
    () => selectedStudents.map((student) => student.id),
    [selectedStudents],
  );
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

  const searchResults = useMemo(() => {
    if (!showResults || !search.trim()) {
      return [];
    }

    const normalizedSearch = search.trim().toLowerCase();

    return availableStudents.filter((student) => {
      const fullName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        student.role === "STUDENT" &&
        !enrolledUserIds.includes(student.id) &&
        !selectedUserIds.includes(student.id) &&
        (fullName.includes(normalizedSearch) ||
          student.email.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [
    availableStudents,
    enrolledUserIds,
    search,
    selectedUserIds,
    showResults,
  ]);

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleClear = () => {
    setSearch("");
    setShowResults(false);
    setSelectedStudents([]);
  };

  const handleSelectStudent = (student: AppUser) => {
    setSelectedStudents((currentStudents) => [...currentStudents, student]);
    setSearch("");
    setShowResults(false);
  };

  const handleRemoveSelectedStudent = (studentId: string) => {
    setSelectedStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentId),
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      return;
    }

    setIsAddingStudents(true);
    setError(null);
    setSuccessMessage(null);

    const failedStudentIds = await enrollStudentsInCourse(
      courseId,
      selectedStudents.map((student) => student.id),
    );
    const successfulStudents = selectedStudents.filter(
      (student) => !failedStudentIds.includes(student.id),
    );

    if (successfulStudents.length > 0) {
      try {
        setEnrolledStudents(await getCourseEnrolledStudents(courseId));
      } catch {
        setError(
          "Los estudiantes fueron matriculados, pero no se pudo actualizar la lista.",
        );
      }
    }

    if (failedStudentIds.length > 0) {
      setError(
        `No se pudo matricular a ${failedStudentIds.length} estudiante(s). Es posible que ya esten matriculados o que el curso no tenga cupos.`,
      );
    }

    if (successfulStudents.length > 0) {
      setSuccessMessage(
        `${successfulStudents.length} estudiante(s) matriculado(s) correctamente.`,
      );
    }

    setSelectedStudents([]);
    setSearch("");
    setShowResults(false);
    setIsAddingStudents(false);
  };

  const handleEnrollmentStatusChange = async (
    enrollmentId: string,
    isCurrentlyEnrolled: boolean,
  ) => {
    const nextStatus = isCurrentlyEnrolled ? "WITHDRAWN" : "ACTIVE";

    setUpdatingEnrollmentId(enrollmentId);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateCourseEnrollmentStatus(enrollmentId, nextStatus);
      setEnrolledStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === enrollmentId
            ? { ...student, isEnrolled: nextStatus === "ACTIVE" }
            : student,
        ),
      );
      setSuccessMessage(
        nextStatus === "ACTIVE"
          ? "Estudiante matriculado nuevamente."
          : "Estudiante retirado del curso.",
      );
    } catch {
      setError("No se pudo actualizar el estado de la matrícula.");
    } finally {
      setUpdatingEnrollmentId(null);
    }
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
        setError(
          "Prediction-service no devolvio una recomendacion para este estudiante.",
        );
        return;
      }

      setStudentPredictions((currentPredictions) => [
        prediction,
        ...currentPredictions.filter(
          (currentPrediction) => currentPrediction.studentId !== studentId,
        ),
      ]);
      setSuccessMessage("Recomendacion actualizada desde prediction-service.");
    } catch {
      setError("No se pudo actualizar la recomendacion desde prediction-service.");
    } finally {
      setRegeneratingPredictionStudentId(null);
    }
  };

  return (
    <div>
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

      <TeacherCourseStudentsToolbar
        search={search}
        selectedStudents={selectedStudents}
        searchResults={searchResults}
        onSearchChange={setSearch}
        onSearch={handleSearch}
        onClear={handleClear}
        onSelectStudent={handleSelectStudent}
        onRemoveSelectedStudent={handleRemoveSelectedStudent}
        onAddStudents={handleAddStudents}
        isLoadingStudents={isLoadingStudents}
        isAddingStudents={isAddingStudents}
      />

      <TeacherCourseStudentsTable
        students={enrolledStudents}
        studentPredictionsById={studentPredictionsById}
        updatingEnrollmentId={updatingEnrollmentId}
        regeneratingPredictionStudentId={regeneratingPredictionStudentId}
        onEnrollmentStatusChange={handleEnrollmentStatusChange}
        onRegeneratePrediction={handleRegeneratePrediction}
      />
    </div>
  );
}
