import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import UserAvatar from "@/components/atoms/UserAvatar";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";
import Modal from "@/components/molecules/Modal";
import OptionsMenu from "@/components/molecules/OptionsMenu";

import AdminStudentRecord, {
  type StudentRecordTab,
} from "@/features/admin/components/AdminStudentRecord";
import AdminUserRestrictionDialog from "@/features/admin/components/AdminUserRestrictionDialog";
import useAdminUserDetail, {
  type UserDraftChanges,
} from "@/features/admin/hooks/useAdminUserDetail";
import {
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
  USER_ROLE_TONES,
  USER_STATUS_LABELS,
} from "@/features/admin/utils/userRoles";
import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";
import type { UserStatus } from "@/services/users/users.service";
import type { UserRole } from "@/types/user/role.types";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  cedula: string;
  bio: string;
  role: UserRole;
  status: UserStatus;
}

const STUDENT_TABS: { id: StudentRecordTab; label: string }[] = [
  { id: "profile", label: "Datos personales" },
  { id: "guardians", label: "Representantes" },
  { id: "consents", label: "Consentimientos" },
];

interface AdminUserEditProps {
  userId: string;
}

export default function AdminUserEdit({ userId }: AdminUserEditProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const detail = useAdminUserDetail(userId);
  const { user } = detail;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentTab, setStudentTab] = useState<StudentRecordTab>("profile");

  // El borrador se vuelve a armar cada vez que llega el usuario del servidor.
  useEffect(() => {
    if (!user) return;
    setDraft({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      cedula: user.cedula ?? "",
      bio: user.bio ?? "",
      role: user.role,
      status: user.isActive ? "ACTIVE" : "INACTIVE",
    });
    setAvatarFile(null);
    setAvatarPreviewUrl(undefined);
  }, [user]);

  const isOwnAccount = user?.id === currentUserId;
  const isAdminAccount = user?.role === "ADMIN";
  // Un administrador no se desactiva ni cambia de rol desde aquí, y nadie debe
  // quitarse el acceso a sí mismo.
  const accessLocked = isOwnAccount || isAdminAccount;

  const changes = useMemo<UserDraftChanges>(() => {
    if (!user || !draft) return {};
    const next: UserDraftChanges = {};

    if (draft.firstName.trim() !== (user.firstName ?? "")) next.firstName = draft.firstName.trim();
    if (draft.lastName.trim() !== (user.lastName ?? "")) next.lastName = draft.lastName.trim();
    if (draft.email.trim() !== (user.email ?? "")) next.email = draft.email.trim();
    if (draft.cedula.trim() !== (user.cedula ?? "")) next.cedula = draft.cedula.trim() || null;
    if (draft.bio.trim() !== (user.bio ?? "")) next.bio = draft.bio.trim() || null;
    if (draft.role !== user.role) next.role = draft.role;
    if (draft.status !== (user.isActive ? "ACTIVE" : "INACTIVE")) next.status = draft.status;

    return next;
  }, [user, draft]);

  const hasChanges = Object.keys(changes).length > 0 || avatarFile !== null;

  const validationError = useMemo(() => {
    if (!draft) return null;
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      return "Los nombres y apellidos son obligatorios.";
    }
    if (!EMAIL_PATTERN.test(draft.email.trim())) {
      return "Ingresa un correo válido.";
    }
    return null;
  }, [draft]);

  const setField = <K extends keyof Draft>(field: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [field]: value } : current));

  const handleAvatarChange = (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Solo se aceptan imágenes jpg, jpeg o png.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("La imagen no debe superar los 2 MB.");
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (!user) return;
    setDraft({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      cedula: user.cedula ?? "",
      bio: user.bio ?? "",
      role: user.role,
      status: user.isActive ? "ACTIVE" : "INACTIVE",
    });
    setAvatarFile(null);
    setAvatarPreviewUrl(undefined);
    setAvatarError(null);
  };

  const handleSave = () => {
    if (!hasChanges || validationError) return;
    void detail.save(changes, avatarFile);
  };

  const handleDelete = async () => {
    const removed = await detail.remove();
    setIsDeleteOpen(false);
    if (removed) {
      navigate(APP_PATHS.admin.users, { replace: true });
    }
  };

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="gap-2 px-4 py-2 text-sm"
            onClick={() => navigate(APP_PATHS.admin.users)}
          >
            <FiArrowLeft aria-hidden="true" />
            Volver a usuarios
          </Button>

          {user ? (
            <OptionsMenu
              ariaLabel="Opciones del usuario"
              items={[
                {
                  label: "Eliminar usuario",
                  icon: <FiTrash2 size={15} aria-hidden="true" />,
                  tone: "danger",
                  disabled: isOwnAccount || isAdminAccount,
                  onSelect: () => setIsDeleteOpen(true),
                },
              ]}
            />
          ) : null}
        </div>

        {detail.isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <Text variant="small">Cargando usuario...</Text>
          </div>
        ) : null}

        {detail.loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <Text variant="small" className="font-medium text-red-700">
              {detail.loadError}
            </Text>
          </div>
        ) : null}

        {user && draft ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <UserAvatar
                imageUrl={avatarPreviewUrl ?? user.avatarUrl ?? undefined}
                firstName={user.firstName}
                lastName={user.lastName}
                className="!h-16 !w-16"
              />
              <div className="min-w-0 flex-1">
                <Heading as="h3" className="text-gray-900">
                  {fullName}
                </Heading>
                <Text variant="small" className="mt-1 break-all">
                  {user.email}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={USER_ROLE_TONES[user.role]}>
                  {USER_ROLE_LABELS[user.role]}
                </Badge>
                <Badge tone={user.isActive ? "blue" : "red"}>
                  {user.isActive
                    ? USER_STATUS_LABELS.ACTIVE
                    : USER_STATUS_LABELS.INACTIVE}
                </Badge>
              </div>
            </div>

            {user.role === "STUDENT" ? (
              <div role="tablist" className="flex flex-wrap gap-2 border-b border-gray-200">
                {STUDENT_TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={studentTab === item.id}
                    onClick={() => setStudentTab(item.id)}
                    className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                      studentTab === item.id
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div
              className={`rounded-2xl border border-gray-200 bg-white p-6 ${
                user.role === "STUDENT" && studentTab !== "profile" ? "hidden" : ""
              }`}
            >
              <Heading as="h5" className="text-gray-900">
                Datos editables
              </Heading>
              <Text variant="caption" className="mt-1">
                Los cambios se aplican al pulsar «Guardar cambios».
              </Text>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="user-first-name">Nombres</Label>
                  <Input
                    id="user-first-name"
                    value={draft.firstName}
                    onChange={(event) => setField("firstName", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="user-last-name">Apellidos</Label>
                  <Input
                    id="user-last-name"
                    value={draft.lastName}
                    onChange={(event) => setField("lastName", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="user-email">Correo</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={draft.email}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="user-cedula">Cédula</Label>
                  <Input
                    id="user-cedula"
                    value={draft.cedula}
                    placeholder="Sin cédula registrada"
                    onChange={(event) => setField("cedula", event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="user-role">Rol</Label>
                  <Select
                    id="user-role"
                    value={draft.role}
                    disabled={accessLocked}
                    onChange={(event) => setField("role", event.target.value as UserRole)}
                  >
                    {USER_ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="user-status">Estado de la cuenta</Label>
                  <Select
                    id="user-status"
                    value={draft.status}
                    disabled={accessLocked}
                    onChange={(event) => setField("status", event.target.value as UserStatus)}
                  >
                    <option value="ACTIVE">{USER_STATUS_LABELS.ACTIVE}</option>
                    <option value="INACTIVE">{USER_STATUS_LABELS.INACTIVE}</option>
                  </Select>
                </div>
              </div>

              {accessLocked ? (
                <Text variant="caption" className="mt-3">
                  {isOwnAccount
                    ? "No puedes cambiar tu propio rol ni desactivar tu cuenta."
                    : "El rol y el estado de un administrador no se modifican desde aquí."}
                </Text>
              ) : null}

              <div className="mt-5">
                <Label htmlFor="user-bio">Biografía</Label>
                <Textarea
                  id="user-bio"
                  rows={3}
                  value={draft.bio}
                  placeholder="Sin biografía"
                  onChange={(event) => setField("bio", event.target.value)}
                />
              </div>

              <div className="mt-5 border-t border-gray-200 pt-5">
                <Label>Foto de perfil</Label>
                <div className="mt-2">
                  <ImageUploadPreview
                    imageUrl={avatarPreviewUrl ?? user.avatarUrl ?? undefined}
                    alt={`Foto de perfil de ${fullName}`}
                    helperText={avatarFile ? "Cambiar foto" : "Subir foto de perfil"}
                    onChangeImage={handleAvatarChange}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">jpg, jpeg o png, máximo 2 MB.</p>
                {avatarError ? (
                  <p className="mt-1 text-sm text-red-600">{avatarError}</p>
                ) : null}
                {user.avatarUrl && !avatarFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 !border-red-200 !px-4 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                    onClick={() => void detail.removeAvatar()}
                  >
                    Eliminar foto
                  </Button>
                ) : null}
              </div>

              {validationError && hasChanges ? (
                <p className="mt-4 text-sm font-medium text-red-600">{validationError}</p>
              ) : null}
              {detail.wasSaved && !hasChanges ? (
                <p className="mt-4 text-sm font-medium text-emerald-700">
                  Cambios guardados.
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasChanges || detail.isSaving}
                  onClick={handleReset}
                >
                  Descartar cambios
                </Button>
                <Button
                  type="button"
                  disabled={!hasChanges || Boolean(validationError) || detail.isSaving}
                  onClick={handleSave}
                >
                  {detail.isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>

            {user.role === "STUDENT" ? (
              <AdminStudentRecord studentId={user.id} tab={studentTab} />
            ) : null}
          </div>
        ) : null}
      </Container>

      <Modal
        isOpen={isDeleteOpen}
        ariaLabel="Eliminar usuario"
        onClose={() => setIsDeleteOpen(false)}
      >
        <div className="mx-auto max-w-md text-center">
          <Heading as="h4" className="text-gray-900">
            ¿Eliminar a {fullName}?
          </Heading>
          <Text variant="small" className="mt-3">
            La cuenta se desactiva y deja de poder ingresar. Si tiene cursos
            activos o matrículas, el sistema no permitirá eliminarla.
          </Text>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={detail.isDeleting}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="!bg-red-600 hover:!bg-red-700"
              disabled={detail.isDeleting}
              onClick={() => void handleDelete()}
            >
              {detail.isDeleting ? "Eliminando..." : "Eliminar usuario"}
            </Button>
          </div>
        </div>
      </Modal>

      <AdminUserRestrictionDialog
        message={detail.actionError}
        onClose={detail.clearActionError}
      />
    </section>
  );
}
