import { useMemo, useState } from "react";

import Container from "@/components/atoms/Container";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";

import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import CreateUserForm from "@/features/admin/components/CreateUserForm";
import AdminUserRestrictionDialog from "@/features/admin/components/AdminUserRestrictionDialog";
import useAdminUsers from "@/features/admin/hooks/useAdminUsers";
import type { AppUser } from "@/types/user/user.types";

interface UserRoleSectionProps {
  title: string;
  description: string;
  users: AppUser[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showRoleColumn?: boolean;
  onToggleStatus?: (userId: string) => void;
  onToggleTeacherRole?: (userId: string) => void;
  deletingUserId?: string | null;
  onDeleteUser?: (userId: string) => Promise<boolean>;
  onSaveUserProfile?: (
    userId: string,
    payload: { email?: string; firstName?: string; lastName?: string }
  ) => Promise<AppUser>;
  onUploadAvatar?: (userId: string, file: File) => Promise<AppUser>;
  onDeleteAvatar?: (userId: string) => Promise<AppUser>;
}

function UserRoleSection({
  title,
  description,
  users,
  isLoading,
  error,
  currentPage,
  pageSize,
  totalUsers,
  totalPages,
  onPageChange,
  showRoleColumn,
  onToggleStatus,
  onToggleTeacherRole,
  deletingUserId,
  onDeleteUser,
  onSaveUserProfile,
  onUploadAvatar,
  onDeleteAvatar,
}: UserRoleSectionProps) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-b-0 border-gray-200 bg-white px-5 py-4">
        <div>
          <Heading as="h5" className="text-gray-900">
            {title}
          </Heading>
          <Text variant="caption" className="mt-1 text-gray-600">
            {description}
          </Text>
        </div>

      </div>

      {error ? (
        <div className="border-x border-gray-200 bg-red-50 px-6 py-4">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-b-2xl border-x border-b border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : (
        <AdminUsersTable
          users={users}
          showRoleColumn={showRoleColumn}
          onToggleStatus={onToggleStatus}
          onToggleTeacherRole={onToggleTeacherRole}
          deletingUserId={deletingUserId}
          onDeleteUser={onDeleteUser}
          onSaveUserProfile={onSaveUserProfile}
          onUploadAvatar={onUploadAvatar}
          onDeleteAvatar={onDeleteAvatar}
        />
      )}

      {!isLoading && !error ? (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalUsers}
          totalPages={totalPages}
          itemLabel="usuarios"
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}

export default function AdminUsersManagement() {
  const {
    search,
    setSearch,
    clearSearch,
    mutationError,
    clearMutationError,
    admins,
    teachers,
    guardians,
    secretaries,
    deces,
    inspectors,
    students,
    toggleStatus,
    toggleTeacherRole,
    saveUserProfile,
    uploadAvatar,
    deleteAvatar,
    createUser,
    isCreatingUser,
    createUserError,
    clearCreateUserError,
    deletingUserId,
    removeUser,
  } = useAdminUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const stats = useMemo(
    () => ({
      admins: admins.totalUsers,
      teachers: teachers.totalUsers,
      students: students.totalUsers,
      total: admins.totalUsers + teachers.totalUsers + students.totalUsers,
    }),
    [admins.totalUsers, teachers.totalUsers, students.totalUsers]
  );

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-blue-100 text-blue-700">Administración</Badge>
            <Heading as="h3" className="mt-3 text-gray-900">
              Gestión de usuarios
            </Heading>

            <Text variant="small" className="mt-2 max-w-2xl">
              Visualiza usuarios registrados, administra su estado de cuenta,
              edita sus datos principales y filtra por contexto académico.
            </Text>
          </div>

          <Button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            Crear usuario
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value={String(stats.total)} label="Usuarios totales" />
          <StatCard value={String(stats.admins)} label="Administradores" />
          <StatCard value={String(stats.teachers)} label="Docentes" />
          <StatCard value={String(stats.students)} label="Estudiantes" />
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <Text
              variant="caption"
              className="font-semibold uppercase tracking-[0.2em] text-gray-600"
            >
              Buscar usuarios
            </Text>
            <Text variant="small" className="mt-1 text-gray-600">
              La búsqueda aplica a todas las tablas de abajo.
            </Text>
          </div>

          <SearchBar
            value={search}
            placeholder="Buscar por nombres, apellidos o correo"
            onChange={setSearch}
            onClear={clearSearch}
            onSearch={() => {}}
          />
        </div>

        <UserRoleSection
          title="Administradores"
          description="Cuentas con acceso total al panel administrativo."
          users={admins.users}
          isLoading={admins.isLoading}
          error={admins.error}
          currentPage={admins.currentPage}
          pageSize={admins.pageSize}
          totalUsers={admins.totalUsers}
          totalPages={admins.totalPages}
          onPageChange={admins.setCurrentPage}
          onToggleStatus={toggleStatus}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="Docentes"
          description="Cuentas con cursos y estudiantes a cargo."
          users={teachers.users}
          isLoading={teachers.isLoading}
          error={teachers.error}
          currentPage={teachers.currentPage}
          pageSize={teachers.pageSize}
          totalUsers={teachers.totalUsers}
          totalPages={teachers.totalPages}
          onPageChange={teachers.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          onToggleTeacherRole={toggleTeacherRole}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="Estudiantes"
          description="Cuentas de estudiantes; la matrícula y el paralelo se gestionan en Estudiantes."
          users={students.users}
          isLoading={students.isLoading}
          error={students.error}
          currentPage={students.currentPage}
          pageSize={students.pageSize}
          totalUsers={students.totalUsers}
          totalPages={students.totalPages}
          onPageChange={students.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          onToggleTeacherRole={toggleTeacherRole}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="Representantes"
          description="Madres, padres y tutores legales que siguen a sus representados."
          users={guardians.users}
          isLoading={guardians.isLoading}
          error={guardians.error}
          currentPage={guardians.currentPage}
          pageSize={guardians.pageSize}
          totalUsers={guardians.totalUsers}
          totalPages={guardians.totalPages}
          onPageChange={guardians.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="Secretaría"
          description="Personal que gestiona matrículas y fichas de estudiantes."
          users={secretaries.users}
          isLoading={secretaries.isLoading}
          error={secretaries.error}
          currentPage={secretaries.currentPage}
          pageSize={secretaries.pageSize}
          totalUsers={secretaries.totalUsers}
          totalPages={secretaries.totalPages}
          onPageChange={secretaries.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="DECE"
          description="Consejería estudiantil: recibe las alertas tempranas y acompaña a los estudiantes."
          users={deces.users}
          isLoading={deces.isLoading}
          error={deces.error}
          currentPage={deces.currentPage}
          pageSize={deces.pageSize}
          totalUsers={deces.totalUsers}
          totalPages={deces.totalPages}
          onPageChange={deces.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />

        <UserRoleSection
          title="Inspección"
          description="Controla la asistencia y resuelve las justificaciones de faltas."
          users={inspectors.users}
          isLoading={inspectors.isLoading}
          error={inspectors.error}
          currentPage={inspectors.currentPage}
          pageSize={inspectors.pageSize}
          totalUsers={inspectors.totalUsers}
          totalPages={inspectors.totalPages}
          onPageChange={inspectors.setCurrentPage}
          showRoleColumn
          onToggleStatus={toggleStatus}
          deletingUserId={deletingUserId}
          onDeleteUser={removeUser}
          onSaveUserProfile={saveUserProfile}
          onUploadAvatar={uploadAvatar}
          onDeleteAvatar={deleteAvatar}
        />
      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        ariaLabel="Crear usuario"
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateUserError();
        }}
      >
        <CreateUserForm
          isSubmitting={isCreatingUser}
          errorMessage={createUserError}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateUserError();
          }}
          onCreateUser={(payload, avatarFile) => {
            void createUser(payload, avatarFile).then((success) => {
              if (success) {
                setIsCreateModalOpen(false);
              }
            });
          }}
        />
      </Modal>

      <AdminUserRestrictionDialog
        message={mutationError}
        onClose={clearMutationError}
      />
    </section>
  );
}
