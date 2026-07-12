import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Container from "@/components/atoms/Container";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import UserProfileCoursesCard from "@/features/profile/components/UserProfileCoursesCard";
import UserProfileDetailsCard from "@/features/profile/components/UserProfileDetailsCard";
import UserProfileHeaderCard from "@/features/profile/components/UserProfileHeaderCard";

import { useAuthStore } from "@/store/auth.store";
import {
  deleteCurrentUserAvatar,
  uploadCurrentUserAvatar,
} from "@/services/users/users.service";
import { APP_PATHS } from "@/routes/paths";
import type { UserRole } from "@/types/user/role.types";

interface ProfileCourse {
  id: string;
  name: string;
  semester?: string;
  careerName?: string;
  facultyName?: string;
  credits?: number;
  currentAverage?: number | null;
}

interface UserProfileManagementProps {
  role: Extract<UserRole, "TEACHER" | "STUDENT" | "ADMIN">;
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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageResetToken, setImageResetToken] = useState(0);

  const courseTitle = useMemo(() => {
    return role === "TEACHER" ? "Cursos creados" : "Cursos matriculados";
  }, [role]);

  const academicSummary = useMemo(() => {
    const contextCourse = courses.find(
      (course) => course.facultyName || course.careerName || course.semester
    );
    const totalCredits = courses.reduce(
      (total, course) => total + (course.credits ?? 0),
      0
    );
    const averages = courses
      .map((course) => course.currentAverage)
      .filter((average): average is number => typeof average === "number");

    return {
      facultyName: contextCourse?.facultyName ?? "Facultad no registrada",
      careerName: contextCourse?.careerName ?? "Carrera no registrada",
      periodName: contextCourse?.semester ?? "Periodo no registrado",
      totalCourses: courses.length,
      totalCredits,
      average:
        averages.length > 0
          ? averages.reduce((total, average) => total + average, 0) /
            averages.length
          : null,
    };
  }, [courses]);

  const dashboardPath =
    role === "STUDENT"
      ? APP_PATHS.student.dashboard
      : role === "TEACHER"
        ? APP_PATHS.teacher.dashboard
        : APP_PATHS.admin.users;

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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge className="bg-blue-100 text-blue-700">
              Perfil academico
            </Badge>

            <Heading as="h3" className="mt-3 text-gray-900">
              Perfil
            </Heading>

            <Text variant="small" className="mt-2 max-w-2xl text-gray-600">
              Consulta tus datos de cuenta y el contexto academico asociado a tu
              periodo actual.
            </Text>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-fit gap-2 px-4 py-2 text-sm"
            onClick={() => {
              navigate(dashboardPath);
            }}
          >
            <FiArrowLeft size={16} />
            Regresar al panel
          </Button>
        </div>

        <div className="space-y-6">
          <UserProfileHeaderCard
            firstName={user.firstName}
            lastName={user.lastName}
            imageUrl={user.avatarUrl ?? undefined}
            onChangeImage={handleChangeImage}
            resetToken={imageResetToken}
          />

          <div className={`grid gap-6 ${role === "ADMIN" ? "" : "lg:grid-cols-2"}`}>
            <UserProfileDetailsCard email={user.email} role={user.role} />

            {role === "ADMIN" ? null : (
              <UserProfileCoursesCard
                title={courseTitle}
                courses={courses}
                isLoading={isCoursesLoading}
                error={coursesError}
              />
            )}
          </div>

          {role === "STUDENT" ? (
            <MotionCard
              as="section"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <Heading as="h5" className="text-blue-700">
                  Contexto academico
                </Heading>
                <Text variant="small" className="mt-2 text-gray-600">
                  Estos datos se calculan con tus materias matriculadas y la
                  informacion disponible del servicio academico.
                </Text>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Facultad", academicSummary.facultyName],
                  ["Carrera", academicSummary.careerName],
                  ["Periodo", academicSummary.periodName],
                  ["Materias", academicSummary.totalCourses.toString()],
                  [
                    "Creditos",
                    academicSummary.totalCredits > 0
                      ? academicSummary.totalCredits.toString()
                      : "--",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <Text
                      variant="caption"
                      className="font-bold uppercase text-gray-500"
                    >
                      {label}
                    </Text>
                    <Text
                      variant="small"
                      className="mt-1 font-semibold text-gray-900"
                    >
                      {value}
                    </Text>
                  </div>
                ))}
              </div>
            </MotionCard>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center">
              <FeedbackMessage
                message={message}
                tone={
                  message.startsWith("No se pudo") ? "error" : "success"
                }
              />
            </div>
          ) : null}

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
