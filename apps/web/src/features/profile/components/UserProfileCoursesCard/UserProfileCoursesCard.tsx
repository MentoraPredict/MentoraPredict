import { FiBookOpen } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface UserProfileCourseSummary {
  id: string;
  name: string;
}

interface UserProfileCoursesCardProps {
  title?: string;
  courses: UserProfileCourseSummary[];
}

export default function UserProfileCoursesCard({
  title = "Cursos",
  courses,
}: UserProfileCoursesCardProps) {
  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <div className="mb-5 flex items-center gap-2">
        <FiBookOpen className="text-blue-700" />

        <Heading as="h5" className="text-blue-700">
          {title}
        </Heading>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                px-4
                                py-3
                            "
            >
              <Text variant="small" className="font-semibold text-gray-900">
                {course.name}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <Text variant="small">No existen cursos asociados a este perfil.</Text>
      )}
    </section>
  );
}
