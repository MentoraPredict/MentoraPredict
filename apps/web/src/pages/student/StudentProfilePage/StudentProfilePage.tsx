import StudentTemplate from "@/components/templates/StudentTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";

const mockStudentCourses = [
  {
    id: "1",
    name: "Álgebra Lineal",
  },
  {
    id: "2",
    name: "Programación II",
  },
  {
    id: "3",
    name: "Matemáticas Discretas",
  },
];

export default function StudentProfilePage() {
  return (
    <StudentTemplate>
      <UserProfileManagement role="STUDENT" courses={mockStudentCourses} />
    </StudentTemplate>
  );
}
