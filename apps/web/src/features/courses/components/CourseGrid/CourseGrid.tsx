import Text from "@/components/atoms/Text";
import CourseCard from "@/features/courses/components/CourseCard";

import type { Course } from "@/types/course";

interface CourseGridProps {
  courses: Course[];
  isDeleteMode?: boolean;
  onCourseClick?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  onCancelDeleteMode?: () => void;
}

export default function CourseGrid({
  courses,
  isDeleteMode = false,
  onCourseClick,
  onDeleteCourse,
  onCancelDeleteMode,
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div
        className="
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-6
                    py-12
                    text-center
                "
      >
        <Text variant="small">No existen cursos registrados.</Text>
      </div>
    );
  }

  return (
    <div
      className="
                grid
                gap-8
                md:grid-cols-2
                xl:grid-cols-3
            "
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isDeleteMode={isDeleteMode}
          onClick={onCourseClick}
          onDelete={onDeleteCourse}
          onCancelDelete={onCancelDeleteMode}
        />
      ))}
    </div>
  );
}
