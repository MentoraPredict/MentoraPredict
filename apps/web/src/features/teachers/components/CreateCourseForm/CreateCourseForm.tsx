import { useState } from "react";
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

interface CreateCourseFormValues {
  name: string;
  description: string;
  semester: string;
  image?: FileList;
}

interface CreateCourseFormProps {
  availableStudents: AppUser[];
  teacherName: string;
  onCancel: () => void;
  onCreateCourse: (course: Course) => void;
}

export default function CreateCourseForm({
  availableStudents,
  teacherName,
  onCancel,
  onCreateCourse,
}: CreateCourseFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<AppUser[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    defaultValues: {
      name: "",
      description: "",
      semester: "",
    },
  });

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

  const onSubmit = (values: CreateCourseFormValues) => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: values.name,
      teacherName,
      semester: values.semester,
      description: values.description,
      riskLevel: "LOW",
    };

    onCreateCourse(course);

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
            <Label htmlFor="semester">Semestre</Label>

            <Select
              id="semester"
              hasError={!!errors.semester}
              {...register("semester", {
                required: true,
              })}
            >
              <option value="">Selecciona el semestre</option>
              <option value="2024-I">2024-I</option>
              <option value="2024-II">2024-II</option>
              <option value="2025-I">2025-I</option>
              <option value="2025-II">2025-II</option>
            </Select>
          </div>
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

        <Button type="submit">Crear Curso</Button>
      </div>
    </form>
  );
}
