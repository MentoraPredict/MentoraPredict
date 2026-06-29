import api from "./api";
import { endpoints } from "./api/endpoints";
import type {
    AuthTokens,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    LoginCredentials,
    RegisterCredentials,
    RegisterResponse,
    RefreshTokenPayload,
    ResetPasswordPayload,
} from "@/types/auth/auth.types";

export async function login(
    credentials: LoginCredentials
): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>(
        endpoints.auth.login,
        credentials
    );

    return response.data;
}

export async function refresh(
    payload: RefreshTokenPayload
): Promise<Pick<AuthTokens, "accessToken" | "expiresIn">> {
    const response = await api.post<
        Pick<AuthTokens, "accessToken" | "expiresIn">
    >(endpoints.auth.refresh, payload);

    return response.data;
}

export async function logout(
    payload: RefreshTokenPayload
): Promise<void> {
    await api.post(endpoints.auth.logout, payload);
}

export async function register(
    credentials: RegisterCredentials
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        endpoints.auth.register,
        credentials
    );

    return response.data;
}

export async function forgotPassword(
    payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>(
        endpoints.auth.forgotPassword,
        payload
    );

    return response.data ?? {};
}

export async function resetPassword(
    payload: ResetPasswordPayload
): Promise<void> {
    await api.post(endpoints.auth.resetPassword, payload);
}
