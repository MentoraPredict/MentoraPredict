import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiHelpCircle } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

import type { AppUser } from "@/types/user/user.types";
import type {
  CourseCareerOption,
  CourseFacultyOption,
  CoursePeriodOption,
  CreateTeacherCoursePayload,
} from "@/services/academic.service";

interface AdminCreateCourseFormValues {
  name: string;
  code: string;
  description: string;
  credits: string;
  facultyId: string;
  careerId: string;
  academicPeriodId: string;
  maxCapacity: string;
  teacherId: string;
}

export interface AdminCreateCoursePayload
  extends Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName"> {
  teacherId: string;
  teacherName?: string;
}

interface AdminCreateCourseFormProps {
  teachers: AppUser[];
  faculties: CourseFacultyOption[];
  careers: CourseCareerOption[];
  periods: CoursePeriodOption[];
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onCreateCourse: (course: AdminCreateCoursePayload) => void;
}

function getTeacherDisplayName(teacher: AppUser) {
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  return fullName || teacher.email;
}

export default function AdminCreateCourseForm({
  teachers,
  faculties,
  careers,
  periods,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onCreateCourse,
}: AdminCreateCourseFormProps) {
  const [isCodeHelpOpen, setIsCodeHelpOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<AdminCreateCourseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      credits: "4",
      facultyId: "",
      careerId: "",
      academicPeriodId: periods[0]?.id ?? "",
      maxCapacity: "30",
      teacherId: "",
    },
  });

  const selectedFacultyId = watch("facultyId");
  const selectedCareerId = watch("careerId");
  const filteredCareers = useMemo(
    () => careers.filter((career) => career.facultyId === selectedFacultyId),
    [careers, selectedFacultyId]
  );
  const selectedCareer = useMemo(
    () => careers.find((career) => career.id === selectedCareerId),
    [careers, selectedCareerId]
  );

  useEffect(() => {
    if (!getValues("academicPeriodId") && periods[0]?.id) {
      setValue("academicPeriodId", periods[0].id, { shouldValidate: true });
    }
  }, [getValues, periods, setValue]);

  useEffect(() => {
    if (!getValues("facultyId") && faculties[0]?.id) {
      setValue("facultyId", faculties[0].id, { shouldValidate: true });
    }
  }, [faculties, getValues, setValue]);

  useEffect(() => {
    const currentCareerId = getValues("careerId");
    const belongsToFaculty = filteredCareers.some((career) => career.id === currentCareerId);

    if (!belongsToFaculty) {
      setValue("careerId", filteredCareers[0]?.id ?? "", { shouldValidate: true });
    }
  }, [filteredCareers, getValues, setValue]);

  const onSubmit = (values: AdminCreateCourseFormValues) => {
    if (!values.careerId || !values.academicPeriodId || !values.teacherId) {
      return;
    }

    const teacher = teachers.find((item) => item.id === values.teacherId);

    onCreateCourse({
      name: values.name,
      code: values.code,
      description: values.description,
      credits: Number(values.credits),
      careerId: values.careerId,
      academicPeriodId: values.academicPeriodId,
      maxCapacity: Number(values.maxCapacity),
      teacherId: values.teacherId,
      teacherName: teacher ? getTeacherDisplayName(teacher) : undefined,
    });

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h4" className="border-b border-gray-200 pb-4 text-gray-900">
        Crear curso
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
          <Label htmlFor="name">Nombre del Curso</Label>

          <Input
            id="name"
            placeholder="Ingresa el nombre del curso"
            hasError={!!errors.name}
            {...register("name", { required: true })}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="code">Codigo institucional</Label>

              <button
                type="button"
                aria-label="Mostrar recomendacion para el codigo institucional"
                aria-expanded={isCodeHelpOpen}
                aria-controls="admin-course-code-help"
                onClick={() => setIsCodeHelpOpen((isOpen) => !isOpen)}
                className="mb-1 text-gray-500 transition hover:text-blue-700"
              >
                <FiHelpCircle size={17} />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isCodeHelpOpen ? (
                <motion.div
                  id="admin-course-code-help"
                  className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800"
                  initial={{ height: 0, marginBottom: 0, opacity: 0 }}
                  animate={{ height: "auto", marginBottom: 8, opacity: 1 }}
                  exit={{ height: 0, marginBottom: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  Usa las siglas de la carrera en mayusculas, un guion y un
                  numero. Ejemplo: {selectedCareer?.code ?? "SIGLAS"}-701.
                </motion.div>
              ) : null}
            </AnimatePresence>

            <Input
              id="code"
              placeholder="Ej. PW-701"
              hasError={!!errors.code}
              {...register("code", { required: true, maxLength: 20 })}
            />
          </div>

          <div>
            <Label htmlFor="credits">Creditos academicos</Label>

            <Input
              id="credits"
              type="number"
              min={1}
              max={10}
              hasError={!!errors.credits}
              {...register("credits", { required: true, min: 1, max: 10 })}
            />
          </div>

          <div>
            <Label htmlFor="maxCapacity">Capacidad</Label>

            <Input
              id="maxCapacity"
              type="number"
              min={1}
              hasError={!!errors.maxCapacity}
              {...register("maxCapacity", { required: true, min: 1 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>

          <Textarea
            id="description"
            rows={5}
            placeholder="Ingresa una descripción del curso"
            hasError={!!errors.description}
            {...register("description", { required: true })}
          />
        </div>

        <div>
          <Label htmlFor="academicPeriodId">Periodo academico</Label>

          <Select
            id="academicPeriodId"
            disabled
            className="disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            hasError={!!errors.academicPeriodId}
            {...register("academicPeriodId", { required: true })}
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </Select>

          <p className="mt-1 text-xs text-gray-500">
            El curso se crea en el periodo academico activo; no se puede elegir otro.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="facultyId">Facultad</Label>

            <Select
              id="facultyId"
              hasError={!!errors.facultyId}
              {...register("facultyId", { required: true })}
            >
              <option value="">Selecciona la facultad</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="careerId">Carrera</Label>

            <Select
              id="careerId"
              hasError={!!errors.careerId}
              disabled={!selectedFacultyId}
              {...register("careerId", { required: true })}
            >
              <option value="">Selecciona la carrera</option>
              {filteredCareers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="teacherId">Docente asignado</Label>

          <Select
            id="teacherId"
            hasError={!!errors.teacherId}
            {...register("teacherId", { required: "Debes asignar un docente" })}
          >
            <option value="">Selecciona el docente</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {getTeacherDisplayName(teacher)}
              </option>
            ))}
          </Select>
          {errors.teacherId?.message ? (
            <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Curso"}
        </Button>
      </div>
    </form>
  );
}
