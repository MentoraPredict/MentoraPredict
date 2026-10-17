import { AxiosError } from "axios";

import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import { register } from "@/services/auth.service";
import type { AuthSessionUser } from "@/types/auth/auth.types";
import type { AppUser } from "@/types/user/user.types";
import { USER_ROLES, type UserRole } from "@/types/user/role.types";

export type UserStatus = "ACTIVE" | "INACTIVE";

interface UserApiResponse {
  id: string;
  email?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role?: string;
  isActive?: boolean;
  is_active?: boolean;
  status?: UserStatus;
  photo?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  cedula?: string | null;
  bio?: string | null;
  deletedAt?: string | null;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  cedula?: string | null;
  bio?: string | null;
}

export type UsersGroupBy = "role" | "status";

export interface UsersQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole | "";
    status?: UserStatus;
    groupBy?: UsersGroupBy;
}

export interface UsersGroupCount {
    key: string;
    count: number;
}

export interface PaginatedUsersResult {
    data: AppUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    /** Solo viene con `groupBy`: cantidad de usuarios por grupo. */
    groups?: UsersGroupCount[];
}

interface PaginatedUsersApiResponse {
    data: UserApiResponse[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    groups?: UsersGroupCount[];
}

const fallbackUserRole: UserRole = "STUDENT";
const STUDENTS_CACHE_TTL_MS = 5 * 60 * 1000;

let studentsCache: { value: AppUser[]; expiresAt: number } | undefined;
let studentsRequest: Promise<AppUser[]> | undefined;

function isUserRole(role?: string): role is UserRole {
  return USER_ROLES.some((value) => value === role);
}

function toAppUser(user: UserApiResponse): AppUser {
  const isActive = user.isActive ?? user.is_active ?? user.status === "ACTIVE";

  return {
    id: user.id,
    email: user.email ?? "Sin correo registrado",
    firstName: user.firstName ?? user.first_name,
    lastName: user.lastName ?? user.last_name,
    role: isUserRole(user.role) ? user.role : fallbackUserRole,
    isActive,
    createdAt: user.createdAt ?? user.created_at,
    updatedAt: user.updatedAt ?? user.updated_at,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? user.photo,
    cedula: user.cedula ?? null,
    bio: user.bio ?? null,
    deletedAt: user.deletedAt ?? null,
  };
}

export async function getCurrentUser() {
  const response = await api.get<AuthSessionUser>(endpoints.users.me);

  return response.data;
}

function isPaginatedUsersResponse(
    response: UserApiResponse[] | PaginatedUsersApiResponse
): response is PaginatedUsersApiResponse {
    return !Array.isArray(response) && Array.isArray(response.data);
}

export async function getUsers(): Promise<AppUser[]>;
export async function getUsers(query: UsersQuery): Promise<PaginatedUsersResult>;
export async function getUsers(
    query?: UsersQuery
): Promise<AppUser[] | PaginatedUsersResult> {
    const shouldPaginate = query?.page !== undefined || query?.limit !== undefined;
    const response = await api.get<UserApiResponse[] | PaginatedUsersApiResponse>(
        endpoints.users.list,
        {
            params: {
                page: query?.page,
                limit: query?.limit,
                search: query?.search?.trim() || undefined,
                role: query?.role || undefined,
                status: query?.status,
                groupBy: query?.groupBy,
            },
        }
    );

    const rawUsers = isPaginatedUsersResponse(response.data)
        ? response.data.data
        : response.data;
    const loadedUsers = rawUsers.map(toAppUser);

    if (!shouldPaginate || !isPaginatedUsersResponse(response.data)) {
        return loadedUsers;
    }

    return {
        data: loadedUsers,
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
        groups: response.data.groups,
    };
}

export async function uploadCurrentUserAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<AuthSessionUser>(
    endpoints.users.avatar,
    formData,
  );
  return response.data;
}

export async function deleteCurrentUserAvatar() {
  const response = await api.delete<AuthSessionUser>(endpoints.users.avatar);
  return response.data;
}

export async function uploadUserAvatar(
    userId: string,
    file: File
): Promise<AppUser> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<UserApiResponse>(
        endpoints.users.userAvatar(userId),
        formData,
    );
    return toAppUser(response.data);
}

export async function deleteUserAvatar(userId: string): Promise<AppUser> {
    const response = await api.delete<UserApiResponse>(
        endpoints.users.userAvatar(userId)
    );
    return toAppUser(response.data);
}

export async function getStudents(): Promise<AppUser[]> {
  if (studentsCache && studentsCache.expiresAt > Date.now()) {
    return studentsCache.value;
  }

  if (studentsRequest) {
    return studentsRequest;
  }

  studentsRequest = api
    .get<UserApiResponse[]>(endpoints.users.list, {
      params: {
        role: "STUDENT",
        status: "ACTIVE",
      },
    })
    .then((response) => {
      const students = response.data
        .map(toAppUser)
        .filter((user) => user.role === "STUDENT" && user.isActive);

      studentsCache = {
        value: students,
        expiresAt: Date.now() + STUDENTS_CACHE_TTL_MS,
      };

      return students;
    })
    .finally(() => {
      studentsRequest = undefined;
    });

  return studentsRequest;
}

export async function getUserById(userId: string): Promise<AppUser> {
  const response = await api.get<UserApiResponse>(endpoints.users.detail(userId));
  return toAppUser(response.data);
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<AppUser> {
  const response = await api.put<UserApiResponse>(
    endpoints.users.detail(userId),
    payload,
  );

  studentsCache = undefined;

  return toAppUser(response.data);
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
): Promise<AppUser> {
  return updateUser(userId, {
    status: isActive ? "ACTIVE" : "INACTIVE",
  });
}

export async function deleteUser(userId: string): Promise<void> {
    await api.delete(endpoints.users.detail(userId));
    studentsCache = undefined;
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<AppUser> {
  return updateUser(userId, {
    role,
  });
}

export async function getTeachers(): Promise<AppUser[]> {
    const response = await api.get<UserApiResponse[]>(
        endpoints.users.list,
        {
            params: {
                role: "TEACHER",
                status: "ACTIVE",
            },
        }
    );

    return response.data
        .map(toAppUser)
        .filter((user) => user.role === "TEACHER" && user.isActive);
}

export interface CreateUserWithRolePayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

const ROLE_SYNC_RETRY_DELAYS_MS = [500, 1000, 2000];

function isNotFoundError(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 404;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// RegisterUserUseCase creates the user-service profile fire-and-forget, so a
// PUT /users/:id issued right after register() can 404 before that profile
// exists yet. Retry the role assignment a few times before giving up.
async function assignRoleWithRetry(
    userId: string,
    role: UserRole
): Promise<AppUser> {
    for (let attempt = 0; attempt < ROLE_SYNC_RETRY_DELAYS_MS.length; attempt++) {
        try {
            return await updateUserRole(userId, role);
        } catch (error) {
            const isLastAttempt = attempt === ROLE_SYNC_RETRY_DELAYS_MS.length - 1;
            if (!isNotFoundError(error) || isLastAttempt) {
                throw error;
            }
            await sleep(ROLE_SYNC_RETRY_DELAYS_MS[attempt]);
        }
    }

    throw new Error("No se pudo asignar el rol tras varios intentos.");
}

export class PartialUserCreationError extends Error {
    constructor(public readonly user: AppUser) {
        super(
            "El usuario se creó como Estudiante, pero no se pudo asignar el rol solicitado. Asígnalo manualmente desde la tabla."
        );
        this.name = "PartialUserCreationError";
    }
}

export async function createUserWithRole(
    payload: CreateUserWithRolePayload
): Promise<AppUser> {
    const created = await register({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
    });

    const createdUser: AppUser = {
        id: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        role: "STUDENT",
        isActive: true,
        createdAt: created.createdAt,
    };

    if (payload.role === "STUDENT") {
        return createdUser;
    }

    try {
        return await assignRoleWithRetry(created.id, payload.role);
    } catch {
        throw new PartialUserCreationError(createdUser);
    }
}
