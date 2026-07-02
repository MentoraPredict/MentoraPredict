import { FiBookOpen } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

export default function StudentCoursesEmptyState() {
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
      <div
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
                "
      >
        <FiBookOpen size={30} />
      </div>

      <Heading as="h5" className="mt-5 text-gray-900">
        No estás inscrito en ningún curso
      </Heading>

      <Text variant="small" className="mt-2 max-w-md">
        Cuando un docente te agregue a un curso, aparecerá en esta sección para
        que puedas revisar tu progreso académico y tus alertas de riesgo.
      </Text>
    </div>
  );
}
