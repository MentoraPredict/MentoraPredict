import { useMemo, useState } from "react";

import Container from "@/components/atoms/Container";

import CourseGrid from "@/features/courses/components/CourseGrid";
import CreateCourseForm from "@/features/teachers/components/CreateCourseForm";
import CreateCourseModal from "@/features/teachers/components/CreateCourseModal";
import TeacherCoursesEmptyState from "@/features/teachers/components/TeacherCoursesEmptyState";
import TeacherCoursesHeader from "@/features/teachers/components/TeacherCoursesHeader/TeacherCoursesHeader";

import { useAuthStore } from "@/store/auth.store";
import type { Course } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

const mockStudents: AppUser[] = [
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
];

export default function TeacherCoursesManagement() {
  const user = useAuthStore((state) => state.user);

  const teacherName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");

    return fullName || user?.email || "Docente";
  }, [user]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const hasCourses = courses.length > 0;

  const handleCreateCourse = (course: Course) => {
    setCourses((currentCourses) => [...currentCourses, course]);

    setIsCreateModalOpen(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== courseId),
    );

    setIsDeleteMode(false);
  };

  return (
    <>
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
            <TeacherCoursesHeader
              hasCourses={hasCourses}
              isDeleteMode={isDeleteMode}
              onOpenCreateModal={() => {
                setIsCreateModalOpen(true);
              }}
              onEnableDeleteMode={() => {
                setIsDeleteMode(true);
              }}
              onCancelDeleteMode={() => {
                setIsDeleteMode(false);
              }}
            />

            {hasCourses ? (
              <CourseGrid
                courses={courses}
                isDeleteMode={isDeleteMode}
                onDeleteCourse={handleDeleteCourse}
                onCancelDeleteMode={() => {
                  setIsDeleteMode(false);
                }}
              />
            ) : (
              <TeacherCoursesEmptyState
                onCreateCourse={() => {
                  setIsCreateModalOpen(true);
                }}
              />
            )}
          </div>
        </Container>
      </section>

      <CreateCourseModal isOpen={isCreateModalOpen}>
        <CreateCourseForm
          availableStudents={mockStudents}
          teacherName={teacherName}
          onCancel={() => {
            setIsCreateModalOpen(false);
          }}
          onCreateCourse={handleCreateCourse}
        />
      </CreateCourseModal>
    </>
  );
}
