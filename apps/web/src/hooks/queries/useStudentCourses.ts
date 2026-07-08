import { useQuery } from "@tanstack/react-query";

import { getStudentCourses } from "@/services/academic.service";

export default function useStudentCourses() {
  const {
    data: courses = [],
    isLoading,
    error,
    refetch: reload,
  } = useQuery({
    queryKey: ["courses", "student"],
    queryFn: getStudentCourses,
  });

  return {
    courses,
    isLoading,
    error: error ? "No se pudieron cargar las materias." : null,
    reload,
  };
}
