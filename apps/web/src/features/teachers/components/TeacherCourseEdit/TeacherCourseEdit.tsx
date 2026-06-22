import { useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";

import type { Course } from "@/types/course";

interface TeacherCourseEditProps {
  course: Course;
}

export default function TeacherCourseEdit({ course }: TeacherCourseEditProps) {
  const [courseName, setCourseName] = useState(course.name);
  const [description, setDescription] = useState(course.description);
  const [imageUrl, setImageUrl] = useState<string | undefined>(course.imageUrl);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleChangeImage = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const handleCancel = () => {
    setCourseName(course.name);
    setDescription(course.description);
    setImageUrl(course.imageUrl);
    setIsEditingName(false);
  };

  const handleSave = () => {
    console.log({
      courseId: course.id,
      name: courseName,
      description,
      imageUrl,
    });
  };

  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-8
                shadow-sm
            "
    >
      <div
        className="
                    flex
                    flex-col
                    gap-6
                    md:flex-row
                    md:items-start
                "
      >
        <ImageUploadPreview
          imageUrl={imageUrl}
          alt={courseName}
          helperText="¿Cambiar imagen del curso?"
          onChangeImage={handleChangeImage}
        />

        <div className="flex-1 pt-4">
          {isEditingName ? (
            <div className="max-w-md">
              <Label htmlFor="courseName">Nombre del curso</Label>

              <Input
                id="courseName"
                value={courseName}
                onChange={(event) => {
                  setCourseName(event.target.value);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                }}
                className="mt-2"
              >
                <Text variant="caption" className="font-semibold text-blue-700">
                  Confirmar nombre
                </Text>
              </button>
            </div>
          ) : (
            <>
              <Heading as="h3" className="text-gray-900">
                {courseName}
              </Heading>

              <button
                type="button"
                onClick={() => {
                  setIsEditingName(true);
                }}
                className="mt-2"
              >
                <Text variant="caption" className="font-semibold text-blue-700">
                  ¿Editar nombre del curso?
                </Text>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Heading as="h5" className="text-gray-900">
          Descripción del curso
        </Heading>

        <Textarea
          rows={7}
          maxLength={500}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          placeholder="Descripción"
          className="mt-4"
        />

        <div className="mt-2 flex items-center justify-between">
          <button type="button">
            <Text variant="caption" className="font-semibold text-blue-700">
              Cambiar la descripción
            </Text>
          </button>

          <Text variant="caption">{description.length} / 500</Text>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="min-w-28"
        >
          Cancelar
        </Button>

        <Button type="button" onClick={handleSave} className="min-w-28">
          Guardar
        </Button>
      </div>
    </section>
  );
}
