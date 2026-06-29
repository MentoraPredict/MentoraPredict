import { useEffect, useMemo, useState } from "react";

import Text from "@/components/atoms/Text";
import TeacherCourseStudentsTable from "@/features/teachers/components/TeacherCourseStudentsTable";
import TeacherCourseStudentsToolbar from "@/features/teachers/components/TeacherCourseStudentsToolbar";
import { enrollStudentsInCourse } from "@/services/academic.service";
import { getStudents } from "@/services/users/users.service";

import type { CourseEnrolledStudent } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

const initialEnrolledStudents: CourseEnrolledStudent[] = [
  {
    id: "enrolled-1",
    user: {
      id: "1",
      firstName: "Franco",
      lastName: "Paredes",
      email: "franco.paredes@uce.edu.ec",
      role: "STUDENT",
      isActive: true,
    },
    average: 14,
    attendance: 92,
    isEnrolled: true,
  },
  {
    id: "enrolled-2",
    user: {
      id: "2",
      firstName: "Daniela",
      lastName: "Morales",
      email: "daniela.morales@uce.edu.ec",
      role: "STUDENT",
      isActive: true,
    },
    average: 17,
    attendance: 96,
    isEnrolled: true,
  },
];

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
  >(initialEnrolledStudents);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      setIsLoadingStudents(true);
      setError(null);

      try {
        const students = await getStudents();
        if (isMounted) {
          setAvailableStudents(students);
        }
      } catch {
        if (isMounted) {
          setError("No se pudieron cargar los estudiantes disponibles.");
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
  }, []);

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
  }, [availableStudents, enrolledUserIds, search, selectedUserIds, showResults]);

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

    const newEnrolledStudents: CourseEnrolledStudent[] = successfulStudents.map(
      (student) => ({
        id: crypto.randomUUID(),
        user: student,
        average: 0,
        attendance: 0,
        isEnrolled: true,
      }),
    );

    setEnrolledStudents((currentStudents) => [
      ...currentStudents,
      ...newEnrolledStudents,
    ]);

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

  const handleUnenrollStudent = (studentId: string) => {
    setEnrolledStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentId),
    );
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
        onUnenrollStudent={handleUnenrollStudent}
      />
    </div>
  );
}
