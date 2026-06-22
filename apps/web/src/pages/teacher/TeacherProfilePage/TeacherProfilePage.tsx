import TeacherTemplate from "@/components/templates/TeacherTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";

const mockTeacherCourses = [
  {
    id: "1",
    name: "Analítica Predictiva",
  },
  {
    id: "2",
    name: "Fundamentos de IA",
  },
  {
    id: "3",
    name: "Gestión de Datos",
  },
];

export default function TeacherProfilePage() {
  return (
    <TeacherTemplate>
      <UserProfileManagement role="TEACHER" courses={mockTeacherCourses} />
    </TeacherTemplate>
  );
}
