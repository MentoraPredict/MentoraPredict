import { USER_ROLES, type UserRole } from "@/types/user/role.types";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
  GUARDIAN: "Representante",
  SECRETARY: "Secretaría",
  DECE: "DECE",
  INSPECTOR: "Inspección",
};

export const USER_ROLE_TONES: Record<
  UserRole,
  "blue" | "green" | "violet" | "amber"
> = {
  ADMIN: "blue",
  TEACHER: "green",
  STUDENT: "violet",
  GUARDIAN: "amber",
  SECRETARY: "blue",
  DECE: "violet",
  INSPECTOR: "amber",
};

/** Roles en el orden en que se ofrecen en filtros y formularios. */
export const USER_ROLE_OPTIONS = USER_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABELS[role],
}));

export const USER_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
} as const;
