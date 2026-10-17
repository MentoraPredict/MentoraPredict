import { Fragment } from "react";
import { FiChevronRight, FiEdit2 } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import UserAvatar from "@/components/atoms/UserAvatar";
import AdminUserRoleCell from "@/features/admin/components/AdminUserRoleCell";
import AdminUserStatusCell from "@/features/admin/components/AdminUserStatusCell";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
} from "@/features/admin/utils/userRoles";
import type {
  UsersGroupBy,
  UsersGroupCount,
} from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";

interface AdminUsersTableProps {
  users: AppUser[];
  groupBy?: UsersGroupBy | "";
  /** Con `groupBy`: conteo de cada grupo (los usuarios llegan al abrirlo). */
  groups?: UsersGroupCount[];
  expandedGroups?: string[];
  groupUsers?: Record<string, AppUser[]>;
  onToggleGroup?: (key: string) => void;
  onEditUser: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
}

const COLUMN_COUNT = 5;

const HEADERS = ["Usuario", "Correo", "Rol", "Estado", "Acciones"];

function getGroupLabel(key: string, groupBy: UsersGroupBy): string {
  if (groupBy === "role") {
    return USER_ROLE_LABELS[key as UserRole] ?? key;
  }
  return key.toUpperCase() === "ACTIVE"
    ? USER_STATUS_LABELS.ACTIVE
    : USER_STATUS_LABELS.INACTIVE;
}

interface UserRowProps {
  user: AppUser;
  onEditUser: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
}

function UserRow({ user, onEditUser, onToggleStatus }: UserRowProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sin nombre";

  return (
    <tr className="border-t border-gray-200 transition hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            imageUrl={user.avatarUrl ?? undefined}
            firstName={user.firstName}
            lastName={user.lastName}
          />
          <Text
            variant="small"
            className="font-medium text-gray-900"
            title={fullName}
          >
            {fullName}
          </Text>
        </div>
      </td>

      <td className="px-4 py-3">
        <Text variant="small" className="truncate" title={user.email}>
          {user.email}
        </Text>
      </td>

      <td className="px-4 py-3 text-center">
        <AdminUserRoleCell role={user.role} />
      </td>

      <td className="px-4 py-3 text-center">
        <AdminUserStatusCell
          isActive={user.isActive}
          onToggleStatus={() => onToggleStatus(user.id)}
        />
      </td>

      <td className="px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2 px-3 py-2 text-sm"
          onClick={() => onEditUser(user.id)}
        >
          <FiEdit2 size={14} aria-hidden="true" />
          Editar
        </Button>
      </td>
    </tr>
  );
}

export default function AdminUsersTable({
  users,
  groupBy = "",
  groups = [],
  expandedGroups = [],
  groupUsers = {},
  onToggleGroup,
  onEditUser,
  onToggleStatus,
}: AdminUsersTableProps) {
  const isGrouped = groupBy !== "";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              {HEADERS.map((header, index) => (
                <th
                  key={header}
                  className={`px-4 py-4 ${index >= 2 && index <= 3 ? "text-center" : ""}`}
                >
                  <Text
                    variant="caption"
                    className="font-bold uppercase tracking-[0.14em] text-gray-600"
                  >
                    {header}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!isGrouped
              ? users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEditUser={onEditUser}
                    onToggleStatus={onToggleStatus}
                  />
                ))
              : groups.map((group) => {
                  const isOpen = expandedGroups.includes(group.key);
                  const members = groupUsers[group.key];

                  return (
                    <Fragment key={group.key}>
                      <tr className="border-t border-gray-200 bg-blue-50/60">
                        <td colSpan={COLUMN_COUNT} className="p-0">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => onToggleGroup?.(group.key)}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left transition hover:bg-blue-50"
                          >
                            <FiChevronRight
                              size={16}
                              aria-hidden="true"
                              className={`shrink-0 text-blue-800 transition-transform ${
                                isOpen ? "rotate-90" : ""
                              }`}
                            />
                            <Text
                              variant="small"
                              className="font-semibold text-blue-900"
                            >
                              {getGroupLabel(group.key, groupBy)} ({group.count})
                            </Text>
                          </button>
                        </td>
                      </tr>

                      {isOpen && !members ? (
                        <tr className="border-t border-gray-200">
                          <td colSpan={COLUMN_COUNT} className="px-6 py-4">
                            <Text variant="small">Cargando...</Text>
                          </td>
                        </tr>
                      ) : null}

                      {isOpen
                        ? members?.map((user) => (
                            <UserRow
                              key={user.id}
                              user={user}
                              onEditUser={onEditUser}
                              onToggleStatus={onToggleStatus}
                            />
                          ))
                        : null}
                    </Fragment>
                  );
                })}

            {(isGrouped ? groups.length === 0 : users.length === 0) ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-6 py-12 text-center">
                  <Text variant="small">No se encontraron usuarios.</Text>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}