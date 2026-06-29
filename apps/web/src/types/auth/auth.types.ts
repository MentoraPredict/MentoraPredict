import type { AppUser } from "@/types/user/user.types";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}

export interface RegisterResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AuthSessionUser["role"];
    createdAt: string;
}

export interface RefreshTokenPayload {
    refreshToken: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    message?: string;
    token?: string;
}

export interface ResetPasswordPayload {
    token: string;
    newPassword: string;
}

export type AuthSessionUser = AppUser;
