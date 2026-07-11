import { useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import StatCard from "@/components/molecules/StatCard";

import AdminCreateCourseForm from "@/features/admin/components/AdminCreateCourseForm";
import CourseGrid from "@/features/courses/components/CourseGrid";
import useAdminCourses from "@/features/admin/hooks/useAdminCourses";
import usePagination from "@/hooks/usePagination";
import type { Course } from "@/types/course";

const COURSES_PER_PAGE = 6;
const UNASSIGNED_TEACHER_LABEL = "Docente sin asignar";

interface EditCourseModalProps {
  course: Course;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSave: (payload: { name: string; description: string }) => void;
}

function EditCourseForm({
  course,
  isSubmitting,
  errorMessage,
  onCancel,
  onSave,
}: EditCourseModalProps) {
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name: name.trim(), description: description.trim() });
      }}
    >
      <Heading as="h4" className="border-b border-gray-200 pb-4 text-gray-900">
        Editar curso
      </Heading>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 space-y-5">
        <div>
          <Label htmlFor="edit-course-name">Nombre del Curso</Label>
          <Input
            id="edit-course-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-course-description">Descripción</Label>
          <Textarea
            id="edit-course-description"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminCoursesManagement() {
  const {
    courses,
    teachers,
    faculties,
    careers,
    periods,
    isLoading,
    error,
    creationDataError,
    isCreating,
    createError,
    clearCreateError,
    deletingCourseId,
    updatingCourseId,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useAdminCourses();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const {
    currentPage,
    paginatedItems: paginatedCourses,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(courses, COURSES_PER_PAGE);

  const stats = useMemo(() => {
    const activePeriod = periods.find((period) => period.status === "ACTIVE");

    return {
      total: courses.length,
      assigned: courses.filter((course) => course.teacherName !== UNASSIGNED_TEACHER_LABEL)
        .length,
      inActivePeriod: activePeriod
        ? courses.filter((course) => course.semester === activePeriod.name).length
        : 0,
    };
  }, [courses, periods]);

  const hasCourses = courses.length > 0;

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-blue-100 text-blue-700">Administración</Badge>
            <Heading as="h3" className="mt-3 text-gray-900">
              Cursos
            </Heading>

            <Text variant="small" className="mt-2 max-w-2xl">
              Crea, edita y elimina cursos, y asigna un docente real a cada uno.
            </Text>
          </div>

          {hasCourses ? (
            <div className="flex flex-wrap gap-3">
              {isDeleteMode ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteMode(false)}
                  className="px-4 py-2 text-sm"
                >
                  Cancelar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteMode(true)}
                  className="gap-2 px-4 py-2 text-sm"
                >
                  <FiTrash2 />
                  Eliminar curso
                </Button>
              )}

              <Button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 px-4 py-2 text-sm"
              >
                <FiPlus />
                Crear curso
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
              Crear curso
            </Button>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={String(stats.total)} label="Cursos totales" />
          <StatCard value={String(stats.assigned)} label="Con docente asignado" />
          <StatCard value={String(stats.inActivePeriod)} label="En periodo activo" />
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-6 py-4">
            <Text variant="small" className="font-medium text-red-700">
              {error}
            </Text>
          </div>
        ) : null}

        {creationDataError ? (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4">
            <Text variant="small" className="font-medium text-amber-700">
              {creationDataError}
            </Text>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">Cargando cursos...</Text>
          </div>
        ) : (
          <CourseGrid
            courses={paginatedCourses}
            isDeleteMode={isDeleteMode}
            deletingCourseId={deletingCourseId}
            showTeacherDetails
            onSecondaryCourseAction={(courseId) => {
              const course = courses.find((item) => item.id === courseId);
              if (course) setEditingCourse(course);
            }}
            secondaryCourseActionLabel="Editar"
            onDeleteCourse={async (courseId) => {
              const success = await deleteCourse(courseId);
              if (success) setIsDeleteMode(false);
            }}
            onCancelDeleteMode={() => setIsDeleteMode(false)}
          />
        )}

        {!isLoading && !error ? (
          <Pagination
            currentPage={currentPage}
            pageSize={COURSES_PER_PAGE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="cursos"
            onPageChange={setCurrentPage}
          />
        ) : null}
      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        ariaLabel="Crear curso"
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
      >
        <AdminCreateCourseForm
          teachers={teachers}
          faculties={faculties}
          careers={careers}
          periods={periods}
          isSubmitting={isCreating}
          errorMessage={createError}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateError();
          }}
          onCreateCourse={(payload) => {
            void createCourse(payload).then((created) => {
              if (created) setIsCreateModalOpen(false);
            });
          }}
        />
      </Modal>

      <Modal
        isOpen={!!editingCourse}
        ariaLabel="Editar curso"
        onClose={() => setEditingCourse(null)}
      >
        {editingCourse ? (
          <EditCourseForm
            course={editingCourse}
            isSubmitting={updatingCourseId === editingCourse.id}
            errorMessage={error}
            onCancel={() => setEditingCourse(null)}
            onSave={(payload) => {
              void updateCourse(editingCourse.id, payload).then((success) => {
                if (success) setEditingCourse(null);
              });
            }}
          />
        ) : null}
      </Modal>
    </section>
  );
}
