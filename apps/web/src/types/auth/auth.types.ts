import type { AppUser } from "@/types/user/user.types";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}

export interface RefreshTokenPayload {
    refreshToken: string;
}

export type AuthSessionUser = AppUser;
