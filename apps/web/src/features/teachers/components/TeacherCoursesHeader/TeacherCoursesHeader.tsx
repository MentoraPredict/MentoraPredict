import { FiPlus, FiTrash2 } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";

interface TeacherCoursesHeaderProps {
  hasCourses: boolean;
  isDeleteMode: boolean;
  onOpenCreateModal: () => void;
  onEnableDeleteMode: () => void;
  onCancelDeleteMode: () => void;
}

export default function TeacherCoursesHeader({
  hasCourses,
  isDeleteMode,
  onOpenCreateModal,
  onEnableDeleteMode,
  onCancelDeleteMode,
}: TeacherCoursesHeaderProps) {
  return (
    <div
      className="
                mb-8
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-center
                md:justify-between
            "
    >
      <div>
        <Heading as="h3" className="text-gray-900">
          Mis Cursos
        </Heading>

        <div className="mt-2 h-1 w-14 rounded-full bg-blue-700" />
      </div>

      {hasCourses ? (
        <div className="flex flex-wrap gap-3">
          {isDeleteMode ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelDeleteMode}
              className="px-4 py-2 text-sm"
            >
              Cancelar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onEnableDeleteMode}
              className="gap-2 px-4 py-2 text-sm"
            >
              <FiTrash2 />
              Eliminar Curso
            </Button>
          )}

          <Button
            type="button"
            onClick={onOpenCreateModal}
            className="gap-2 px-4 py-2 text-sm"
          >
            <FiPlus />
            Crear Curso
          </Button>
        </div>
      ) : null}
    </div>
  );
}
