import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import { getStudentAcademicContext } from "@/services/academic.service";
import type { AuthSessionUser } from "@/types/auth/auth.types";
import type { AppUser } from "@/types/user/user.types";
import type { UserRole } from "@/types/user/role.types";

type UserStatus = "ACTIVE" | "INACTIVE";

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
}

interface UpdateUserPayload {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    status?: UserStatus;
}

const fallbackUserRole: UserRole = "STUDENT";
const STUDENTS_CACHE_TTL_MS = 5 * 60 * 1000;

let studentsCache: { value: AppUser[]; expiresAt: number } | undefined;
let studentsRequest: Promise<AppUser[]> | undefined;

function isUserRole(role?: string): role is UserRole {
  return role === "STUDENT" || role === "TEACHER" || role === "ADMIN";
}

function toAppUser(user: UserApiResponse): AppUser {
    const isActive =
        user.isActive ??
        user.is_active ??
        user.status === "ACTIVE";

    return {
        id: user.id,
        email: user.email ?? "Sin correo registrado",
        firstName: user.firstName ?? user.first_name,
        lastName: user.lastName ?? user.last_name,
        role: isUserRole(user.role)
            ? user.role
            : fallbackUserRole,
        isActive,
        createdAt: user.createdAt ?? user.created_at,
        updatedAt: user.updatedAt ?? user.updated_at,
        avatarUrl: user.avatarUrl ?? user.avatar_url ?? user.photo,
    };
}

async function enrichStudentContext(user: AppUser): Promise<AppUser> {
    if (user.role !== "STUDENT") {
        return user;
    }

    try {
        const context = await getStudentAcademicContext(user.id);

        if (!context) {
            return user;
        }

        return {
            ...user,
            facultyName: context.facultyName,
            careerName: context.careerName,
            semester: context.semester,
        };
    } catch {
        return user;
    }
}

export async function getCurrentUser() {
  const response = await api.get<AuthSessionUser>(endpoints.users.me);

  return response.data;
}

export async function getUsers(): Promise<AppUser[]> {
  const response = await api.get<UserApiResponse[]>(endpoints.users.list);

    const loadedUsers = response.data.map(toAppUser);
    return Promise.all(loadedUsers.map((user) => enrichStudentContext(user)));
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

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<AppUser> {
  return updateUser(userId, {
    role,
  });
}
