import axios, { AxiosError } from "axios";

import { endpoints } from "./api/endpoints";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
} from "./api/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface RefreshResponse {
    accessToken: string;
    expiresIn: number;
}

interface ApiErrorResponse {
    exp?: string;
    message?: string;
}

type RetriableRequestConfig = NonNullable<
    AxiosError["config"]
> & {
    _retry?: boolean;
};

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}${endpoints.auth.refresh}`,
        { refreshToken },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    setAccessToken(response.data.accessToken);

    return response.data.accessToken;
}

function shouldRefreshToken(error: AxiosError<ApiErrorResponse>) {
    const status = error.response?.status;
    const response = error.response?.data;
    const requestUrl = error.config?.url ?? "";

    return (
        status === 401 &&
        response?.exp === "token expired" &&
        !requestUrl.includes(endpoints.auth.refresh)
    );
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest =
            error.config as RetriableRequestConfig | undefined;

        if (
            !originalRequest ||
            originalRequest._retry ||
            !shouldRefreshToken(error)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            refreshPromise ??= requestNewAccessToken();
            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearTokens();
            return Promise.reject(refreshError);
        } finally {
            refreshPromise = null;
        }
    }
);

export default api;
