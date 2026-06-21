import { useMemo, useState } from "react";

import TeacherCourseStudentsTable from "@/features/teachers/components/TeacherCourseStudentsTable";
import TeacherCourseStudentsToolbar from "@/features/teachers/components/TeacherCourseStudentsToolbar";

import type { CourseEnrolledStudent } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

const mockAvailableStudents: AppUser[] = [
  {
    id: "1",
    firstName: "Franco",
    lastName: "Paredes",
    email: "franco.paredes@uce.edu.ec",
    role: "STUDENT",
    isActive: true,
  },
  {
    id: "2",
    firstName: "Daniela",
    lastName: "Morales",
    email: "daniela.morales@uce.edu.ec",
    role: "STUDENT",
    isActive: true,
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@uce.edu.ec",
    role: "STUDENT",
    isActive: true,
  },
  {
    id: "4",
    firstName: "Valeria",
    lastName: "Quishpe",
    email: "valeria.quishpe@uce.edu.ec",
    role: "STUDENT",
    isActive: true,
  },
];

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

export default function TeacherCourseStudents() {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<AppUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<
    CourseEnrolledStudent[]
  >(initialEnrolledStudents);

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

    return mockAvailableStudents.filter((student) => {
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
  }, [enrolledUserIds, search, selectedUserIds, showResults]);

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

  const handleAddStudents = () => {
    if (selectedStudents.length === 0) {
      return;
    }

    const newEnrolledStudents: CourseEnrolledStudent[] = selectedStudents.map(
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

    setSelectedStudents([]);
    setSearch("");
    setShowResults(false);
  };

  const handleUnenrollStudent = (studentId: string) => {
    setEnrolledStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== studentId),
    );
  };

  return (
    <div>
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
      />

      <TeacherCourseStudentsTable
        students={enrolledStudents}
        onUnenrollStudent={handleUnenrollStudent}
      />
    </div>
  );
}
