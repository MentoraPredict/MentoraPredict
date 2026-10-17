import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiHelpCircle } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";

import type { AppUser } from "@/types/user/user.types";
import type {
  CoursePeriodOption,
  CreateTeacherCoursePayload,
} from "@/services/academic.service";

interface AdminCreateCourseFormValues {
  name: string;
  code: string;
  description: string;
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
  periods: CoursePeriodOption[];
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onCreateCourse: (course: AdminCreateCoursePayload, imageFile?: File) => void;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function getTeacherDisplayName(teacher: AppUser) {
  const fullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
  return fullName || teacher.email;
}

export default function AdminCreateCourseForm({
  teachers,
  periods,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onCreateCourse,
}: AdminCreateCourseFormProps) {
  const [isCodeHelpOpen, setIsCodeHelpOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AdminCreateCourseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      academicPeriodId: periods[0]?.id ?? "",
      maxCapacity: "30",
      teacherId: "",
    },
  });

  useEffect(() => {
    if (!getValues("academicPeriodId") && periods[0]?.id) {
      setValue("academicPeriodId", periods[0].id, { shouldValidate: true });
    }
  }, [getValues, periods, setValue]);

  const onSubmit = (values: AdminCreateCourseFormValues) => {
    if (!values.academicPeriodId || !values.teacherId) {
      return;
    }

    const teacher = teachers.find((item) => item.id === values.teacherId);

    onCreateCourse(
      {
        name: values.name,
        code: values.code,
        description: values.description,
        academicPeriodId: values.academicPeriodId,
        maxCapacity: Number(values.maxCapacity),
        teacherId: values.teacherId,
        teacherName: teacher ? getTeacherDisplayName(teacher) : undefined,
      },
      imageFile ?? undefined
    );

    reset();
    setImageFile(null);
    setImagePreviewUrl(undefined);
    setImageError(null);
  };

  const handleImageChange = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Solo se aceptan imagenes jpg, jpeg o png.");
      setImageFile(null);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("La imagen no debe superar los 2MB.");
      setImageFile(null);
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
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

        <div className="grid gap-5 md:grid-cols-2">
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
                  Usa las siglas de la asignatura en mayusculas, un guion y un
                  numero. Ejemplo: MAT-101.
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

        <div>
          <Label>Imagen del curso (opcional)</Label>

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
