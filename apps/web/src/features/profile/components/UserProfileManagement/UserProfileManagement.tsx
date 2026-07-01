import { useMemo } from "react";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";

import UserProfileCoursesCard from "@/features/profile/components/UserProfileCoursesCard";
import UserProfileDetailsCard from "@/features/profile/components/UserProfileDetailsCard";
import UserProfileHeaderCard from "@/features/profile/components/UserProfileHeaderCard";

import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/user/role.types";

interface ProfileCourse {
  id: string;
  name: string;
}

interface UserProfileManagementProps {
  role: Extract<UserRole, "TEACHER" | "STUDENT">;
  courses: ProfileCourse[];
  isCoursesLoading?: boolean;
  coursesError?: string | null;
}

export default function UserProfileManagement({
  role,
  courses,
  isCoursesLoading = false,
  coursesError = null,
}: UserProfileManagementProps) {
  const user = useAuthStore((state) => state.user);

  const courseTitle = useMemo(() => {
    return role === "TEACHER" ? "Cursos creados" : "Cursos matriculados";
  }, [role]);

  const handleChangeImage = (file: File) => {
    console.log("Nueva imagen de perfil:", file);
  };

  const handleCancel = () => {
    console.log("Cancelar cambios");
  };

  const handleSave = () => {
    console.log("Guardar perfil");
  };

  if (!user) {
    return null;
  }

  return (
    <section className="py-8">
      <Container>
        <Heading as="h3" className="mb-6 text-gray-900">
          Perfil
        </Heading>

        <div className="space-y-6">
          <UserProfileHeaderCard
            firstName={user.firstName}
            lastName={user.lastName}
            onChangeImage={handleChangeImage}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <UserProfileDetailsCard email={user.email} role={user.role} />

            <UserProfileCoursesCard
              title={courseTitle}
              courses={courses}
              isLoading={isCoursesLoading}
              error={coursesError}
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-28"
            >
              Cancelar
            </Button>

            <Button type="button" onClick={handleSave} className="min-w-28">
              Guardar
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
