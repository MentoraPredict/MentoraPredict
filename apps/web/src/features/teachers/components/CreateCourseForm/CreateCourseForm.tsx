import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  CoursePeriodOption,
  CreateTeacherCoursePayload,
} from "@/services/academic.service";

interface CreateCourseFormValues {
  name: string;
  code: string;
  description: string;
  credits: string;
  careerId: string;
  academicPeriodId: string;
  maxCapacity: string;
  image?: FileList;
}

interface CreateCourseFormProps {
  availableStudents: AppUser[];
  careers: CourseCareerOption[];
  periods: CoursePeriodOption[];
  teacherName: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onCreateCourse: (
    course: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">
  ) => Promise<Course | null> | Course | null | void;
}

export default function CreateCourseForm({
  availableStudents,
  careers,
  periods,
  teacherName,
  isSubmitting = false,
  onCancel,
  onCreateCourse,
}: CreateCourseFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<AppUser[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      credits: "4",
      careerId: "",
      academicPeriodId: periods[0]?.id ?? "",
      maxCapacity: "30",
    },
  });

  useEffect(() => {
    if (!getValues("academicPeriodId") && periods[0]?.id) {
      setValue("academicPeriodId", periods[0].id, {
        shouldValidate: true,
      });
    }
  }, [getValues, periods, setValue]);

  useEffect(() => {
    if (!getValues("careerId") && careers[0]?.id) {
      setValue("careerId", careers[0].id, {
        shouldValidate: true,
      });
    }
  }, [careers, getValues, setValue]);

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

    const createdCourse = await onCreateCourse({
      name: values.name,
      code: values.code,
      description: values.description,
      credits: Number(values.credits),
      careerId: values.careerId,
      academicPeriodId: values.academicPeriodId,
      maxCapacity: Number(values.maxCapacity),
    });

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
            <Label htmlFor="code">Codigo</Label>

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
            <Label htmlFor="credits">Creditos</Label>

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
              })}
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
            {...register("description", {
              required: true,
            })}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="image">Imagen del Curso</Label>

            <Input
              id="image"
              type="file"
              accept="image/*"
              {...register("image")}
            />
          </div>

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

        <div>
          <Label htmlFor="careerId">Carrera</Label>

          <Select
            id="careerId"
            hasError={!!errors.careerId}
            {...register("careerId", {
              required: true,
            })}
          >
            <option value="">Selecciona la carrera</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </Select>
        </div>

        <StudentSelector
          students={availableStudents}
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
