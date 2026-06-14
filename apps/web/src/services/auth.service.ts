import api from "./api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export async function login(
    credentials: LoginRequest
): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
        "/v1/auth/login",
        credentials
    );

    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        response.data.accessToken
    );
    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        response.data.refreshToken
    );

    return response.data;
}

export function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}
