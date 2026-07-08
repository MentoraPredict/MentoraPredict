import { useQuery } from "@tanstack/react-query";

import { getAdminCourses } from "@/services/academic.service";

export default function useAdminCourses() {
  const {
    data: courses = [],
    isLoading,
    error,
    refetch: reload,
  } = useQuery({
    queryKey: ["courses", "admin"],
    queryFn: getAdminCourses,
  });

  return {
    courses,
    isLoading,
    error: error ? "No se pudieron cargar las materias." : null,
    reload,
  };
}
