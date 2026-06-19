import { create } from "zustand";

import { login as loginRequest, logout as logoutRequest, refresh as refreshRequest } from "@/services/auth.service";
import { getCurrentUser } from "@/services/users/users.service";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setTokens } from "@/services/api/tokenStorage";
import { decodeJwtPayload } from "@/utils/jwt";
import type { LoginCredentials, AuthTokens, AuthSessionUser } from "@/types/auth/auth.types";

interface JwtSessionPayload {
    sub?: string;
    email?: string;
    role?: AuthSessionUser["role"];
}

interface AuthState {
    user: AuthSessionUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (
        credentials: LoginCredentials
    ) => Promise<AuthSessionUser>;
    refreshSession: () => Promise<string | null>;
    hydrateSession: () => Promise<void>;
    logout: () => Promise<void>;
    clearSession: () => void;
}

function buildUserFallback(
    accessToken: string
): AuthSessionUser | null {
    const payload = decodeJwtPayload<JwtSessionPayload>(
        accessToken
    );

    if (!payload?.sub || !payload?.email || !payload?.role) {
        return null;
    }

    return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        isActive: true,
    };
}

export const useAuthStore = create<AuthState>(
    (set, get) => ({
        user: null,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        isAuthenticated: !!getAccessToken(),
        isHydrated: false,

        login: async (credentials) => {
            const tokens: AuthTokens =
                await loginRequest(credentials);

            setTokens(
                tokens.accessToken,
                tokens.refreshToken
            );

            let user: AuthSessionUser | null = null;

            try {
                user = await getCurrentUser();
            } catch {
                user = buildUserFallback(
                    tokens.accessToken
                );
            }

            if (!user) {
                clearTokens();
                throw new Error(
                    "No se pudo resolver la sesion del usuario"
                );
            }

            set({
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                isAuthenticated: true,
                isHydrated: true,
            });

            return user;
        },

        refreshSession: async () => {
            const refreshToken =
                get().refreshToken ?? getRefreshToken();

            if (!refreshToken) {
                get().clearSession();
                return null;
            }

            const response = await refreshRequest({
                refreshToken,
            });

            setAccessToken(response.accessToken);

            set((state) => ({
                ...state,
                accessToken: response.accessToken,
                isAuthenticated: true,
            }));

            return response.accessToken;
        },

        hydrateSession: async () => {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (!accessToken || !refreshToken) {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isHydrated: true,
                });
                return;
            }

            set({
                accessToken,
                refreshToken,
                isAuthenticated: true,
            });

            try {
                const user = await getCurrentUser();
                set({
                    user,
                    isHydrated: true,
                });
                return;
            } catch {
                const fallbackUser =
                    buildUserFallback(accessToken);

                if (!fallbackUser) {
                    get().clearSession();
                    set({ isHydrated: true });
                    return;
                }

                set({
                    user: fallbackUser,
                    isHydrated: true,
                    isAuthenticated: true,
                });
            }
        },

        logout: async () => {
            const refreshToken =
                get().refreshToken ?? getRefreshToken();

            try {
                if (refreshToken) {
                    await logoutRequest({
                        refreshToken,
                    });
                }
            } catch {
                // Ignore backend logout failures and still clear the local session.
            } finally {
                get().clearSession();
            }
        },

        clearSession: () => {
            clearTokens();
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            });
        },
    })
);
