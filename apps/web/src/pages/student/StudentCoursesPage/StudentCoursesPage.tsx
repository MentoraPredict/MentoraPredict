import StudentTemplate from "@/components/templates/StudentTemplate";
import StudentCoursesManagement from "@/features/students/components/StudentCoursesManagement";

export default function StudentCoursesPage() {
  return (
    <StudentTemplate>
      <StudentCoursesManagement />
    </StudentTemplate>
  );
}
