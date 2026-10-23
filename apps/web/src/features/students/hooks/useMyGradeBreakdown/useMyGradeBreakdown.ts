import { useQuery } from "@tanstack/react-query";

import { getMyGradeBreakdown } from "@/services/grading.service";

export default function useMyGradeBreakdown(subjectId: string) {
  const query = useQuery({
    queryKey: ["grade-breakdown", subjectId],
    queryFn: () => getMyGradeBreakdown(subjectId),
    enabled: Boolean(subjectId),
  });

  return {
    breakdown: query.data ?? null,
    isLoading: query.isLoading,
    hasError: query.isError,
  };
}