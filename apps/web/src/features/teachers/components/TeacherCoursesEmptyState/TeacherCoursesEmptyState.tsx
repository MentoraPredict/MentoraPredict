import { FiPlusCircle } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface TeacherCoursesEmptyStateProps {
  onCreateCourse: () => void;
}

export default function TeacherCoursesEmptyState({
  onCreateCourse,
}: TeacherCoursesEmptyStateProps) {
  return (
    <div
      className="
                flex
                min-h-80
                flex-col
                items-center
                justify-center
                text-center
            "
    >
      <button
        type="button"
        onClick={onCreateCourse}
        className="
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-blue-300
                    bg-blue-50
                    text-blue-700
                    transition
                    hover:bg-blue-100
                "
      >
        <FiPlusCircle size={30} />
      </button>

      <Heading as="h5" className="mt-5 text-gray-900">
        Crear Curso
      </Heading>

      <Text variant="caption" className="mt-2 max-w-xs">
        Configura una nueva aula virtual y comienza a gestionar el progreso de
        tus alumnos.
      </Text>

      <Button type="button" onClick={onCreateCourse} className="mt-6 gap-2">
        Crear Curso
      </Button>
    </div>
  );
}
