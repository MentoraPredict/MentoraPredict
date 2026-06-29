import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiHelpCircle } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

import StudentSelector from "@/features/teachers/components/StudentSelector";

import type { Course } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";
import type {
  CourseCareerOption,
  CourseFacultyOption,
  CoursePeriodOption,
  CreateTeacherCoursePayload,
} from "@/services/academic.service";

interface CreateCourseFormValues {
  name: string;
  code: string;
  description: string;
  credits: string;
  facultyId: string;
  careerId: string;
  academicPeriodId: string;
  maxCapacity: string;
}

interface CreateCourseFormProps {
  availableStudents: AppUser[];
  faculties: CourseFacultyOption[];
  careers: CourseCareerOption[];
  periods: CoursePeriodOption[];
  teacherName: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onCreateCourse: (
    course: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">,
    studentIds: string[]
  ) => Promise<Course | null> | Course | null | void;
}

export default function CreateCourseForm({
  availableStudents,
  faculties,
  careers,
  periods,
  teacherName,
  isSubmitting = false,
  onCancel,
  onCreateCourse,
}: CreateCourseFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<AppUser[]>([]);
  const [isCodeHelpOpen, setIsCodeHelpOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      credits: "4",
      facultyId: "",
      careerId: "",
      academicPeriodId: periods[0]?.id ?? "",
      maxCapacity: "30",
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
  const studentOptions = useMemo(
    () =>
      availableStudents.filter(
        (student) => student.role === "STUDENT" && student.isActive
      ),
    [availableStudents]
  );

  useEffect(() => {
    if (!getValues("academicPeriodId") && periods[0]?.id) {
      setValue("academicPeriodId", periods[0].id, {
        shouldValidate: true,
      });
    }
  }, [getValues, periods, setValue]);

  useEffect(() => {
    if (!getValues("facultyId") && faculties[0]?.id) {
      setValue("facultyId", faculties[0].id, {
        shouldValidate: true,
      });
    }
  }, [faculties, getValues, setValue]);

  useEffect(() => {
    const currentCareerId = getValues("careerId");
    const belongsToFaculty = filteredCareers.some(
      (career) => career.id === currentCareerId
    );

    if (!belongsToFaculty) {
      setValue("careerId", filteredCareers[0]?.id ?? "", {
        shouldValidate: true,
      });
    }
  }, [filteredCareers, getValues, setValue]);

  const handleSelectStudent = (student: AppUser) => {
    setSelectedStudents((current) => {
      const exists = current.some((item) => item.id === student.id);

      if (exists) {
        return current;
      }

      return [...current, student];
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents((current) =>
      current.filter((student) => student.id !== studentId),
    );
  };

  const onSubmit = async (values: CreateCourseFormValues) => {
    if (!values.careerId || !values.academicPeriodId) {
      return;
    }

    const createdCourse = await onCreateCourse(
      {
        name: values.name,
        code: values.code,
        description: values.description,
        credits: Number(values.credits),
        careerId: values.careerId,
        academicPeriodId: values.academicPeriodId,
        maxCapacity: Number(values.maxCapacity),
      },
      selectedStudents.map((student) => student.id)
    );

    if (!createdCourse) {
      return;
    }

    reset();
    setSelectedStudents([]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h4" className="border-b border-gray-200 pb-4 text-gray-900">
        Crear Curso
      </Heading>

      <div className="mt-5 space-y-5">
        <div>
          <Label htmlFor="name">Nombre del Curso</Label>

          <Input
            id="name"
            placeholder="Ingresa el nombre del curso"
            hasError={!!errors.name}
            {...register("name", {
              required: true,
            })}
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
                onClick={() => {
                  setIsCodeHelpOpen((isOpen) => !isOpen);
                }}
                className="mb-1 text-gray-500 transition hover:text-blue-700"
              >
                <FiHelpCircle size={17} />
              </button>
            </div>

            {isCodeHelpOpen ? (
              <div className="mb-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
                Usa las siglas de la carrera en mayusculas, un guion y un numero.
                Ejemplo: {selectedCareer?.code ?? "SIGLAS"}-701.
              </div>
            ) : null}

            <Input
              id="code"
              placeholder="Ej. PW-701"
              hasError={!!errors.code}
              {...register("code", {
                required: true,
                maxLength: 20,
              })}
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
              {...register("credits", {
                required: true,
                min: 1,
                max: 10,
              })}
            />
          </div>

          <div>
            <Label htmlFor="maxCapacity">Capacidad</Label>

            <Input
              id="maxCapacity"
              type="number"
              min={1}
              hasError={!!errors.maxCapacity}
              {...register("maxCapacity", {
                required: true,
                min: 1,
                validate: (value) =>
                  Number(value) >= selectedStudents.length ||
                  "La capacidad no puede ser menor que los estudiantes seleccionados.",
              })}
            />
            {errors.maxCapacity?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxCapacity.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>

          <Textarea
            id="description"
            rows={5}
            placeholder="Ingresa una descripción del curso"
            hasError={!!errors.description}
            {...register("description", {
              required: true,
            })}
          />
        </div>

        <div>
          <div>
            <Label htmlFor="academicPeriodId">Periodo academico</Label>

            <Select
              id="academicPeriodId"
              hasError={!!errors.academicPeriodId}
              {...register("academicPeriodId", {
                required: true,
              })}
            >
              <option value="">Selecciona el periodo</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="facultyId">Facultad</Label>

            <Select
              id="facultyId"
              hasError={!!errors.facultyId}
              {...register("facultyId", {
                required: true,
              })}
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
              {...register("careerId", {
                required: true,
              })}
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

        <StudentSelector
          students={studentOptions}
          selectedStudents={selectedStudents}
          onSelectStudent={handleSelectStudent}
          onRemoveStudent={handleRemoveStudent}
        />
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
