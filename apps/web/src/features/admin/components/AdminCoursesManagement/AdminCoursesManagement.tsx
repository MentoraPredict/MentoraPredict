import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";

import AdminCreateCourseForm from "@/features/admin/components/AdminCreateCourseForm";
import CourseGrid from "@/features/courses/components/CourseGrid";
import useAdminCourses from "@/features/admin/hooks/useAdminCourses";
import usePagination from "@/hooks/usePagination";
import {
  deleteTeacherCourseImage,
  uploadTeacherCourseImage,
} from "@/services/academic.service";
import { getAdminCourseStudentsPath } from "@/routes/paths";
import type { Course } from "@/types/course";

const COURSES_PER_PAGE = 6;
const UNASSIGNED_TEACHER_LABEL = "Docente sin asignar";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface EditCourseModalProps {
  course: Course;
  isSubmitting: boolean;
  isTogglingStatus: boolean;
  isRemovingImage: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSave: (
    payload: { name: string; description: string },
    imageFile?: File
  ) => void;
  onToggleStatus: () => void;
  onRemoveImage: () => void;
}

function EditCourseForm({
  course,
  isSubmitting,
  isTogglingStatus,
  isRemovingImage,
  errorMessage,
  onCancel,
  onSave,
  onToggleStatus,
  onRemoveImage,
}: EditCourseModalProps) {
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(
    course.imageUrl
  );
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Solo se aceptan imagenes jpg, jpeg o png.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("La imagen no debe superar los 2MB.");
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(
          { name: name.trim(), description: description.trim() },
          imageFile ?? undefined
        );
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

        <div>
          <Label>Imagen del curso</Label>

          <div className="mt-2">
            <ImageUploadPreview
              imageUrl={imagePreviewUrl}
              alt="Imagen del curso"
              helperText={imageFile ? "Cambiar imagen" : "Subir imagen del curso"}
              onChangeImage={handleImageChange}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            jpg, jpeg o png, maximo 2MB.
          </p>

          {imageError ? (
            <p className="mt-1 text-sm text-red-600">{imageError}</p>
          ) : null}

          {course.imageUrl && !imageFile ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 px-4 py-2 text-sm text-red-600 hover:border-red-200 hover:bg-red-50"
              disabled={isRemovingImage}
              onClick={() => {
                onRemoveImage();
                setImagePreviewUrl(undefined);
              }}
            >
              {isRemovingImage ? "Eliminando..." : "Eliminar imagen"}
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <Text variant="small" className="font-semibold text-gray-800">
              Estado del curso
            </Text>
            <Text variant="caption" className="mt-1 text-gray-600">
              {course.isActive ?? true ? "Curso activo" : "Curso inactivo"}
            </Text>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isTogglingStatus}
            onClick={onToggleStatus}
            className="px-4 py-2 text-sm"
          >
            {isTogglingStatus
              ? "Guardando..."
              : (course.isActive ?? true)
                ? "Desactivar"
                : "Activar"}
          </Button>
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
  const navigate = useNavigate();
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
    reload,
    createCourse,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
  } = useAdminCourses();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [removingImageCourseId, setRemovingImageCourseId] = useState<string | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.description.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        !statusFilter || String(course.isActive ?? true) === statusFilter;
      const matchesTeacher =
        !teacherFilter || course.teacherId === teacherFilter;
      const matchesPeriod =
        !periodFilter || course.semester === periodFilter;

      return matchesSearch && matchesStatus && matchesTeacher && matchesPeriod;
    });
  }, [courses, search, statusFilter, teacherFilter, periodFilter]);

  const {
    currentPage,
    paginatedItems: paginatedCourses,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(
    filteredCourses,
    COURSES_PER_PAGE,
    `${search}|${statusFilter}|${teacherFilter}|${periodFilter}`
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTeacherFilter("");
    setPeriodFilter("");
  };

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

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={search}
                placeholder="Buscar por nombre o descripción del curso"
                onChange={setSearch}
                onClear={() => setSearch("")}
                onSearch={() => {}}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="lg:min-w-28"
              onClick={() => setIsFiltersOpen((current) => !current)}
            >
              Filtros
            </Button>
          </div>

          {isFiltersOpen ? (
            <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 lg:grid-cols-4">
              <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-600">
                  Estado
                </Label>
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-600">
                  Docente
                </Label>
                <Select
                  value={teacherFilter}
                  onChange={(event) => setTeacherFilter(event.target.value)}
                >
                  <option value="">Todos los docentes</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {[teacher.firstName, teacher.lastName].filter(Boolean).join(" ") ||
                        teacher.email}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-xs font-semibold text-gray-600">
                  Periodo
                </Label>
                <Select
                  value={periodFilter}
                  onChange={(event) => setPeriodFilter(event.target.value)}
                >
                  <option value="">Todos los periodos</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.name}>
                      {period.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-blue-700
                    transition
                    hover:bg-blue-100
                  "
                >
                  Reiniciar filtros
                </button>
              </div>
            </div>
          ) : null}
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
        ) : filteredCourses.length === 0 && courses.length > 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">
              Ningún curso coincide con la búsqueda o los filtros aplicados.
            </Text>
          </div>
        ) : (
          <CourseGrid
            courses={paginatedCourses}
            isDeleteMode={isDeleteMode}
            deletingCourseId={deletingCourseId}
            showTeacherDetails
            onCourseClick={(courseId) => {
              navigate(getAdminCourseStudentsPath(courseId));
            }}
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
          onCreateCourse={(payload, imageFile) => {
            void createCourse(payload).then(async (created) => {
              if (!created) return;
              setIsCreateModalOpen(false);
              if (imageFile) {
                await uploadTeacherCourseImage(created.id, imageFile).catch(() => null);
                await reload();
              }
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
            isTogglingStatus={updatingCourseId === editingCourse.id}
            isRemovingImage={removingImageCourseId === editingCourse.id}
            errorMessage={error}
            onCancel={() => setEditingCourse(null)}
            onSave={(payload, imageFile) => {
              void updateCourse(editingCourse.id, payload).then(async (success) => {
                if (!success) return;
                if (imageFile) {
                  await uploadTeacherCourseImage(editingCourse.id, imageFile).catch(
                    () => null
                  );
                  await reload();
                }
                setEditingCourse(null);
              });
            }}
            onRemoveImage={() => {
              setRemovingImageCourseId(editingCourse.id);
              void deleteTeacherCourseImage(editingCourse.id)
                .catch(() => null)
                .then(async () => {
                  await reload();
                  setRemovingImageCourseId(null);
                });
            }}
            onToggleStatus={() => {
              const nextIsActive = !(editingCourse.isActive ?? true);
              void updateCourseStatus(editingCourse.id, nextIsActive).then((success) => {
                if (success) {
                  setEditingCourse((current) =>
                    current ? { ...current, isActive: nextIsActive } : current
                  );
                }
              });
            }}
          />
        ) : null}
      </Modal>
    </section>
  );
}
