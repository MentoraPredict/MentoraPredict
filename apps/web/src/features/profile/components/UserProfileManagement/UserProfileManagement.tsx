import { useMemo, useState } from "react";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";

import UserProfileCoursesCard from "@/features/profile/components/UserProfileCoursesCard";
import UserProfileDetailsCard from "@/features/profile/components/UserProfileDetailsCard";
import UserProfileHeaderCard from "@/features/profile/components/UserProfileHeaderCard";

import { useAuthStore } from "@/store/auth.store";
import {
  deleteCurrentUserAvatar,
  uploadCurrentUserAvatar,
} from "@/services/users/users.service";
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
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageResetToken, setImageResetToken] = useState(0);

  const courseTitle = useMemo(() => {
    return role === "TEACHER" ? "Cursos creados" : "Cursos matriculados";
  }, [role]);

  const handleChangeImage = (file: File) => {
    setSelectedImage(file);
    setMessage(null);
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setMessage(null);
    setImageResetToken((current) => current + 1);
  };

  const handleSave = async () => {
    if (!selectedImage) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await uploadCurrentUserAvatar(selectedImage);
      await hydrateSession();
      setSelectedImage(null);
      setImageResetToken((current) => current + 1);
      setMessage("Foto de perfil actualizada.");
    } catch {
      setMessage("No se pudo actualizar la foto de perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await deleteCurrentUserAvatar();
      await hydrateSession();
      setSelectedImage(null);
      setImageResetToken((current) => current + 1);
      setMessage("Foto de perfil eliminada.");
    } catch {
      setMessage("No se pudo eliminar la foto de perfil.");
    } finally {
      setIsSaving(false);
    }
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
            imageUrl={user.avatarUrl ?? undefined}
            onChangeImage={handleChangeImage}
            resetToken={imageResetToken}
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

          {message ? <p className="text-center text-sm text-gray-700">{message}</p> : null}

          <div className="flex flex-wrap justify-center gap-4">
            {user.avatarUrl ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => void handleDeleteAvatar()}
              >
                Eliminar foto
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-28"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || !selectedImage}
              className="min-w-28"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
