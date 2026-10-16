import { useQuery } from "@tanstack/react-query";

import UpcomingActivitiesPanel from "@/features/courses/components/UpcomingActivitiesPanel";
import { getMockUpcomingActivities } from "@/features/students/mocks/coursePerformanceExtras.mock";

interface StudentCourseActivitiesProps {
  courseId: string;
}

export default function StudentCourseActivities({
  courseId,
}: StudentCourseActivitiesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["course-performance", "upcoming-activities", courseId],
    queryFn: () => getMockUpcomingActivities(courseId),
    enabled: Boolean(courseId),
  });

  return <UpcomingActivitiesPanel activities={data ?? null} isLoading={isLoading} />;
}
