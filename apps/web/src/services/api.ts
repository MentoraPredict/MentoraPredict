import axios, { AxiosError } from "axios";

import { endpoints } from "./api/endpoints";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./api/tokenStorage";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

interface ApiErrorResponse {
  message?: string;
}

type RetriableRequestConfig = NonNullable<AxiosError["config"]> & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const correlationId =
    config.headers["x-correlation-id"]?.toString() ?? crypto.randomUUID();
  config.headers["x-correlation-id"] = correlationId;

  logger.debug("API request", {
    method: config.method?.toUpperCase(),
    url: config.url,
    correlationId,
  });

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
    },
  );

  setAccessToken(response.data.accessToken);

  return response.data.accessToken;
}

function shouldRefreshToken(error: AxiosError<ApiErrorResponse>) {
  const status = error.response?.status;
  const requestUrl = error.config?.url ?? "";
  const isRefreshRequest = requestUrl.includes(endpoints.auth.refresh);
  const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

  if (isRefreshRequest || !hadAuthHeader) {
    return false;
  }

  return status === 401;
}

api.interceptors.response.use(
  (response) => {
    logger.debug("API response", {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      correlationId:
        response.headers["x-correlation-id"] ??
        response.config.headers["x-correlation-id"],
    });

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    logger.error("API request failed", error, {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      correlationId:
        error.response?.headers["x-correlation-id"] ??
        error.config?.headers["x-correlation-id"],
    });

    const originalRequest = error.config as RetriableRequestConfig | undefined;

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

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export default api;
