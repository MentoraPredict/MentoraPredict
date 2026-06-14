import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type { AuthSessionUser } from "@/types/auth/auth.types";

export async function getCurrentUser() {
    const response = await api.get<AuthSessionUser>(
        endpoints.users.me
    );

    return response.data;
}
